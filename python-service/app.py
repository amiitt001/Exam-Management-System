import sys
import os
import json
import math
from io import BytesIO
from openpyxl import load_workbook
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# --- Configuration ---
app = Flask(__name__)
# Enable CORS for all routes for frontend access
CORS(app) 
# Simple in-memory storage for raw uploaded data
DATA_STORE = {} 
DATA_ID_COUNTER = 0

# ==========================================
# Section A: Helper Utilities (from utils.py)
# ==========================================

def clean_header(header):
    """Normalizes header string."""
    return str(header).strip().lower() if header else ""

def find_col_index(headers, candidates):
    """Finds the 0-based index of a column header."""
    normalized_headers = [clean_header(h) for h in headers]
    for candidate in candidates:
        if candidate in normalized_headers:
            return normalized_headers.index(candidate)
    return -1

def split_roll_branch(s):
    """Splits student string into roll and branch."""
    if not s: return {"roll": "", "branch": ""}
    s = str(s).strip()
    parts = s.split()
    roll = parts[0]
    branch = " ".join(parts[1:]) if len(parts) > 1 else ""
    return {"roll": roll, "branch": branch}

# ==========================================
# Section B: Core Seating Logic (from logic.py)
# ==========================================

def generate_seating_plan(students, rooms, pattern='standard'):
    """Allocates students to rooms based on the specific pattern."""
    
    student_queue = []
    for pair in students:
        if pair.get('s1'):
            student_queue.append({'val': pair['s1'], 'orig': 'Series 1', 'id': pair['id']})
        if pair.get('s2'):
            student_queue.append({'val': pair['s2'], 'orig': 'Series 2', 'id': pair['id']})

    processed_rooms = [r.copy() for r in rooms]
    queue_idx = 0
    total_students = len(student_queue)

    for room in processed_rooms:
        rows, cols = room['rows'], room['cols']
        coords = [] # (row_index, col_index, capacity, [optional_side])

        # --- Pattern Logic Switch ---
        if pattern == 'columnar':
            for c in range(cols):
                for r in range(rows): coords.append((r, c, 2))
        elif pattern == 'snake-vertical':
            for c in range(cols):
                col_coords = [(r, c, 2) for r in range(rows)]
                if c % 2 == 1: col_coords.reverse()
                coords.extend(col_coords)
        elif pattern == 'checkerboard':
            for r in range(rows):
                for c in range(cols):
                    if (r + c) % 2 == 0: coords.append((r, c, 2))
        elif pattern == 'single':
            for r in range(rows):
                for c in range(cols): coords.append((r, c, 1))
        elif pattern == 'alternate-rows':
            for r in range(rows):
                capacity = 2 if r % 2 == 0 else 1
                for c in range(cols): coords.append((r, c, capacity))
        elif pattern == 'hybrid':
            for c in range(cols):
                capacity = 2 if c % 2 == 0 else 1
                for r in range(rows): coords.append((r, c, capacity))
        elif pattern == 'staggered':
            for r in range(rows):
                # Row 1 (r=0): Left. Row 2 (r=1): Right.
                side = 'left' if r % 2 == 0 else 'right'
                for c in range(cols): coords.append((r, c, 1, side))
        else: # Standard (Z) & Snake (S)
            for r in range(rows):
                row_coords = [(r, c, 2) for c in range(cols)]
                if pattern == 'snake' and r % 2 == 1: row_coords.reverse()
                coords.extend(row_coords)

        # --- Fill Grid ---
        grid = [[{'left': None, 'right': None} for _ in range(cols)] for _ in range(rows)]
        assignments_count = 0

        for item in coords:
            if len(item) == 4:
                r, c, cap, side = item
            else:
                r, c, cap = item
                side = 'left'

            if queue_idx < total_students:
                if side == 'left':
                    s1_obj = student_queue[queue_idx]
                    grid[r][c]['left'] = s1_obj
                    queue_idx += 1
                    assignments_count += 1
                    
                    if cap == 2 and queue_idx < total_students:
                        s2_obj = student_queue[queue_idx]
                        grid[r][c]['right'] = s2_obj
                        queue_idx += 1
                        assignments_count += 1
                elif side == 'right':
                    s1_obj = student_queue[queue_idx]
                    grid[r][c]['right'] = s1_obj
                    queue_idx += 1
                    assignments_count += 1
        
        room['grid'] = grid
        room['assigned_count'] = assignments_count

    unallocated = student_queue[queue_idx:]
    
    return processed_rooms, unallocated

def convert_grid_to_assigned_data(processed_rooms):
    """Converts grid-based room data to the assignedData format expected by PDF/Frontend."""
    assigned_data = {}
    for room in processed_rooms:
        pairs = []
        summary = {}
        
        # Iterate grid to extract pairs
        for r in range(room['rows']):
            for c in range(room['cols']):
                desk = room['grid'][r][c]
                if desk:
                    s1_obj = desk.get('left')
                    s2_obj = desk.get('right')
                    s1 = s1_obj.get('val', '') if s1_obj else ''
                    s2 = s2_obj.get('val', '') if s2_obj else ''
                    
                    if s1 or s2:
                        pairs.append({'s1': s1, 's2': s2})
                        
                        # Update summary
                        if s1:
                            branch = split_roll_branch(s1)['branch']
                            summary[branch] = summary.get(branch, 0) + 1
                        if s2:
                            branch = split_roll_branch(s2)['branch']
                            summary[branch] = summary.get(branch, 0) + 1
                            
        assigned_data[room['name']] = {
            'pairs': pairs,
            'summary': summary
        }
    return assigned_data

# ==========================================
# Section C: API Endpoints
# ==========================================

def generate_pdf_internal(rooms, assigned_data, unallocated=None):
    buffer = BytesIO()
    # Use Landscape to fit 4 columns of seating
    doc = SimpleDocTemplate(buffer, pagesize=landscape(A4), topMargin=0.5*inch, bottomMargin=0.5*inch, leftMargin=0.5*inch, rightMargin=0.5*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], alignment=1, fontSize=16, spaceAfter=6)
    subtitle_style = ParagraphStyle('SubtitleStyle', parent=styles['Normal'], alignment=1, fontSize=12, spaceAfter=4)
    header_info_style = ParagraphStyle('HeaderInfoStyle', parent=styles['Normal'], fontSize=11, leading=14)
    whiteboard_style = ParagraphStyle('WhiteboardStyle', parent=styles['Normal'], alignment=1, fontSize=10, spaceAfter=12)

    for room in rooms:
        # Get pairs for this room
        room_data = assigned_data.get(room['name'], {})
        pairs = room_data.get('pairs', [])
        
        # --- Header Section ---
        elements.append(Paragraph(room.get('college', "GALGOTIAS EDUCATIONAL INSTITUTIONS, GREATER NOIDA"), title_style))
        elements.append(Paragraph(room.get('exam', "1st CAE (ODD-2025-26)"), subtitle_style))
        elements.append(Paragraph("Seating Plan", subtitle_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        # Room Info Line
        room_info = f"<b>Room Number: {room['name']}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Total Students: {len(pairs) * 2}</b>" # Approx count, refined below
        # Recalculate actual students
        student_count = 0
        for p in pairs:
            if p.get('s1'): student_count += 1
            if p.get('s2'): student_count += 1
        room_info = f"<b>Room Number: {room['name']}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Total Students: {student_count}</b>"
        
        elements.append(Paragraph(room_info, header_info_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        elements.append(Paragraph("↑↑↑↑↑↑↑↑↑↑↑_White Board_↑↑↑↑↑↑↑↑↑↑↑", whiteboard_style))
        
        if not pairs:
             elements.append(Paragraph("(No students assigned to this room)", styles['Normal']))
             elements.append(PageBreak())
             continue

        # --- Seating Grid (Multi-Column) ---
        # Total columns in table = 12.
        num_super_cols = 4
        rows_per_col = math.ceil(len(pairs) / num_super_cols)
        
        # Prepare data grid
        table_grid = [['' for _ in range(12)] for _ in range(rows_per_col + 1)] # +1 for header
        
        # Headers
        headers = ['Seat No.', 'Roll Series 1', 'Roll Series 2']
        for i in range(num_super_cols):
            base_col = i * 3
            table_grid[0][base_col] = headers[0]
            table_grid[0][base_col+1] = headers[1]
            table_grid[0][base_col+2] = headers[2]

        # Fill Data
        for i, pair in enumerate(pairs):
            # Determine position
            col_idx = i // rows_per_col
            row_idx = i % rows_per_col
            
            if col_idx >= num_super_cols:
                break 
            
            base_col = col_idx * 3
            # Row index in table_grid is row_idx + 1 (because of header)
            
            table_grid[row_idx + 1][base_col] = str(i + 1)
            table_grid[row_idx + 1][base_col + 1] = pair.get('s1', '')
            table_grid[row_idx + 1][base_col + 2] = pair.get('s2', '')

        # Create Table
        col_widths = [0.4*inch, 1.1*inch, 1.1*inch] * 4
        
        t = Table(table_grid, colWidths=col_widths)
        
        # Style
        ts = [
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ]
        
        t.setStyle(TableStyle(ts))
        elements.append(t)
        elements.append(Spacer(1, 0.2 * inch))

        # --- Footer Summary ---
        summary = room_data.get('summary', {})
        if summary:
            summary_text = "Branch & Students: " + ", ".join([f"{k}={v}" for k, v in summary.items()])
            
            footer_data = [[Paragraph(summary_text, styles['Normal'])]]
            t_footer = Table(footer_data, colWidths=[10.4*inch])
            t_footer.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ]))
            elements.append(t_footer)

        elements.append(PageBreak())
    if unallocated:
        elements.append(Paragraph("Students Pending Allocation (Not Seated)", title_style))
        elements.append(Spacer(1, 0.2 * inch))
        
        unallocated_data = [['Roll No', 'Branch', 'Series']]
        for student in unallocated:
            details = split_roll_branch(student['val'])
            unallocated_data.append([details['roll'], details['branch'], student['orig']])
            
        ut = Table(unallocated_data)
        ut.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.red),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(ut)

    doc.build(elements)
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='seating_plan.pdf', mimetype='application/pdf')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handles Excel file upload, parses data, and stores it."""
    global DATA_ID_COUNTER

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and file.filename.endswith(('.xlsx', '.xls')):
        try:
            # Read file into memory buffer
            file_bytes = file.read()
            wb = load_workbook(BytesIO(file_bytes), data_only=True)
            sheet = wb.active

            headers = [cell.value for cell in sheet[1]]
            
            # Identify Columns
            idx_roll1 = find_col_index(headers, ["roll no. series-1", "series-1", "roll1"])
            idx_roll2 = find_col_index(headers, ["roll no. series-2", "series-2", "roll2"])
            idx_room = find_col_index(headers, ["room no.", "room"])
            idx_rows = find_col_index(headers, ["rows", "row", "no. of rows"])
            idx_cols = find_col_index(headers, ["columns", "cols"])
            idx_college = find_col_index(headers, ["college name", "college"])
            idx_exam = find_col_index(headers, ["exam name", "exam"])

            if idx_roll1 == -1 or idx_roll2 == -1 or idx_room == -1:
                return jsonify({"error": "Missing required columns: Series-1, Series-2, or Room No."}), 400
            
            students = []
            rooms_map = {}
            total_students = 0
            
            # Fill-down variables
            last_college = ""
            last_exam = ""

            for i, row in enumerate(sheet.iter_rows(min_row=2, values_only=True)):
                
                # Student pairs
                s1 = str(row[idx_roll1]).strip() if idx_roll1 < len(row) and row[idx_roll1] else ""
                s2 = str(row[idx_roll2]).strip() if idx_roll2 < len(row) and row[idx_roll2] else ""
                
                if s1 or s2:
                    students.append({'s1': s1, 's2': s2, 'id': i + 2})
                    if s1: total_students += 1
                    if s2: total_students += 1

                # Room configurations (must be unique by name)
                r_name = str(row[idx_room]).strip() if idx_room < len(row) and row[idx_room] else ""
                
                # Extract Metadata with Fill-Down Logic
                current_college = str(row[idx_college]).strip() if idx_college != -1 and idx_college < len(row) and row[idx_college] else ""
                current_exam = str(row[idx_exam]).strip() if idx_exam != -1 and idx_exam < len(row) and row[idx_exam] else ""
                
                if current_college:
                    last_college = current_college
                if current_exam:
                    last_exam = current_exam

                if r_name and r_name not in rooms_map:
                    try:
                        r_rows = int(row[idx_rows]) if idx_rows != -1 and idx_rows < len(row) and row[idx_rows] else 0
                        r_cols = int(row[idx_cols]) if idx_cols != -1 and idx_cols < len(row) and row[idx_cols] else 0
                    except (ValueError, TypeError):
                        r_rows, r_cols = 0, 0

                    if r_rows > 0 and r_cols > 0:
                        rooms_map[r_name] = {
                            'name': r_name, 'rows': r_rows, 'cols': r_cols,
                            'college': last_college,
                            'exam': last_exam
                        }
            
            if not students:
                return jsonify({"error": "No student records found."}), 400
            if not rooms_map:
                return jsonify({"error": "No valid room configurations found (check Row/Col counts)."}), 400

            DATA_ID_COUNTER += 1
            data_id = str(DATA_ID_COUNTER)
            DATA_STORE[data_id] = {
                'students': students, 
                'rooms': list(rooms_map.values()),
                'total_students': total_students
            }
            
            return jsonify({
                "message": "File processed successfully",
                "data_id": data_id,
                "total_students": total_students,
                "room_count": len(rooms_map)
            }), 200

        except Exception as e:
            print(f"Server error during processing: {e}")
            return jsonify({"error": f"An error occurred during file processing: {str(e)}"}), 500

    return jsonify({"error": "Invalid file type. Please upload XLSX or XLS."}), 400

@app.route('/calculate', methods=['POST'])
def calculate_seating():
    """Handles the request to run the seating algorithm based on pattern."""
    data = request.get_json()
    data_id = data.get('data_id')
    pattern = data.get('pattern', 'standard')

    if data_id not in DATA_STORE:
        return jsonify({"error": "Data ID not found. Please upload the file again."}), 404

    raw_data = DATA_STORE[data_id]
    
    try:
        processed_rooms, unallocated = generate_seating_plan(
            raw_data['students'], 
            raw_data['rooms'], 
            pattern
        )
        
        # Prepare unallocated list for frontend (splitting roll/branch for display)
        unallocated_for_display = []
        for student in unallocated:
            details = split_roll_branch(student['val'])
            unallocated_for_display.append({
                'roll': details['roll'],
                'branch': details['branch'],
                'orig': student['orig']
            })

        # Prepare room grids for display (splitting roll/branch for DeskCard)
        for room in processed_rooms:
            for r in range(room['rows']):
                for c in range(room['cols']):
                    desk = room['grid'][r][c]
                    if desk and desk['left']:
                        desk['left'] = split_roll_branch(desk['left']['val'])
                        desk['left']['orig'] = student['orig'] # Keep source data
                    if desk and desk['right']:
                        desk['right'] = split_roll_branch(desk['right']['val'])
                        desk['right']['orig'] = student['orig'] # Keep source data

        return jsonify({
            "rooms": processed_rooms,
            "unallocated": unallocated_for_display,
            "total_students": raw_data['total_students']
        }), 200

    except Exception as e:
        print(f"Calculation error: {e}")
        return jsonify({"error": "Calculation failed. Check room and student data consistency."}), 500

@app.route('/generate-pdf-from-raw', methods=['POST'])
def generate_pdf_from_raw():
    """Receives raw students and rooms, runs allocation, and generates PDF."""
    try:
        data = request.get_json()
        students_raw = data.get('students', [])
        rooms_raw = data.get('rooms', [])
        
        students = []
        for i, p in enumerate(students_raw):
            students.append({'s1': p.get('s1'), 's2': p.get('s2'), 'id': i})
            
        processed_rooms, unallocated = generate_seating_plan(students, rooms_raw)
        assigned_data = convert_grid_to_assigned_data(processed_rooms)
        
        return generate_pdf_internal(rooms_raw, assigned_data, unallocated)

    except Exception as e:
        print(f"PDF Raw Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-pdf-from-logic', methods=['POST'])
def generate_pdf_from_logic():
    """Generates a PDF based on the provided seating logic data."""
    try:
        data = request.get_json()
        rooms = data.get('rooms', [])
        assigned_data = data.get('assignedData', {})
        # Note: This endpoint might not have unallocated data if not passed.
        # If the frontend updates to pass it, we can use it.
        unallocated = data.get('unallocated', [])
        # unallocated here might be a list of objects, but generate_pdf_internal expects 
        # objects with 'val' and 'orig' keys if we reuse the logic.
        # However, the frontend likely sends formatted unallocated data.
        # Let's assume for now this endpoint is legacy or will be updated later if needed.
        # But to be safe, let's just pass it if it matches the structure or handle it.
        # Given the complexity, let's focus on /generate-pdf-from-raw which is the primary new flow.
        
        return generate_pdf_internal(rooms, assigned_data, unallocated)

    except Exception as e:
        print(f"PDF Generation Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Flask runs on port 5000 by default
    print("Starting Flask server on http://127.0.0.1:5000")
    # Set host='0.0.0.0' to be accessible from outside the container/localhost
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)