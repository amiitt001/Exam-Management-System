import flask
from flask import Flask, request, jsonify, Response
import pandas as pd
import pdfplumber
import io
import random
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
import math

app = Flask(__name__)

# --- 1. File Parsing Logic (Now requires branch+year) ---
def parse_student_file(file_storage, mimetype):
    students = []
    try:
        if mimetype == 'text/csv':
            df = pd.read_csv(file_storage)
            roll_col = next(col for col in df.columns if 'roll' in col.lower())
            branch_col = next(col for col in df.columns if 'branch' in col.lower() or 'section' in col.lower())
            year_col = next(col for col in df.columns if 'year' in col.lower() or 'semester' in col.lower())
            
            for _, row in df.iterrows():
                students.append({
                    'roll': str(row[roll_col]).strip(),
                    'branch': str(row[branch_col]).strip(),
                    'year': str(row[year_col]).strip(),
                    'group': f"{str(row[branch_col]).strip()}-{str(row[year_col]).strip()}" # e.g., "CSE-V"
                })
        
        elif mimetype == 'application/pdf':
            # PDF parsing is unreliable, CSV is better
            with pdfplumber.open(file_storage) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    for line in text.split('\n'):
                        parts = line.split() 
                        if len(parts) >= 3:
                            students.append({
                                'roll': parts[0].strip(),
                                'branch': parts[1].strip(),
                                'year': parts[2].strip(),
                                'group': f"{parts[1].strip()}-{parts[2].strip()}"
                            })
        else:
            raise ValueError("Unsupported file type")
            
        return students
    except Exception as e:
        print(f"Error parsing file: {e}")
        raise ValueError(f"Could not parse file. Ensure columns are 'rollNumber', 'branch', and 'year'. Error: {e}")

# --- 2. The "Roll Series" Algorithm ---
def create_roll_series_plan(students, room_list):
    
    # 1. Group students by their 'group' (e.g., "CSE-V")
    groups = {}
    for s in students:
        if not groups.get(s['group']):
            groups[s['group']] = []
        groups[s['group']].append(s)

    # 2. Shuffle each group
    for group in groups:
        random.shuffle(groups[group])

    # 3. Sort groups by size, largest first
    sorted_groups = sorted(groups.values(), key=len, reverse=True)
    
    # 4. Create the two "mega-series"
    # Series 1 gets the largest group
    series_1 = sorted_groups.pop(0) if sorted_groups else []
    
    # Series 2 gets ALL other students, shuffled together
    series_2 = []
    for group in sorted_groups:
        series_2.extend(group)
    random.shuffle(series_2)
    
    # 5. Assign students to rooms
    final_plan = {}
    student_count = len(students)
    students_seated = 0
    s1_idx, s2_idx = 0, 0 # Indexes for our two series

    for room in room_list:
        room_name = room['name']
        capacity = int(room['capacity'])
        
        room_data = {
            'seats': [], # This will be a list of seat pairings
            'summary': {},
            'capacity': capacity
        }

        for i in range(capacity):
            if students_seated >= student_count:
                break # All students are seated
            
            seat = {'seat_num': i + 1, 'student_1': None, 'student_2': None}
            
            # --- Fill Student 1 (from Series 1) ---
            if s1_idx < len(series_1):
                student_1 = series_1[s1_idx]; s1_idx += 1
                seat['student_1'] = student_1
                students_seated += 1
                room_data['summary'][student_1['group']] = room_data['summary'].get(student_1['group'], 0) + 1

            # --- Fill Student 2 (from Series 2) ---
            # To avoid placing from same series, check if student 1 was placed
            if s2_idx < len(series_2) and seat['student_1']:
                student_2 = series_2[s2_idx]; s2_idx += 1
                seat['student_2'] = student_2
                students_seated += 1
                room_data['summary'][student_2['group']] = room_data['summary'].get(student_2['group'], 0) + 1
            
            # If Series 1 is empty, fill both slots from Series 2
            elif not seat['student_1'] and s2_idx + 1 < len(series_2):
                student_1 = series_2[s2_idx]; s2_idx += 1
                student_2 = series_2[s2_idx]; s2_idx += 1
                seat['student_1'] = student_1
                seat['student_2'] = student_2
                students_seated += 2
                room_data['summary'][student_1['group']] = room_data['summary'].get(student_1['group'], 0) + 1
                room_data['summary'][student_2['group']] = room_data['summary'].get(student_2['group'], 0) + 1

            room_data['seats'].append(seat)

        final_plan[room_name] = room_data

    unassigned_count = student_count - students_seated
    return final_plan, unassigned_count


# --- 3. The "Official Template" PDF Generator ---
def generate_pdf_from_plan(plan_data):
    buffer = io.BytesIO()
    doc = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    first_page = True

    for room_name, room in plan_data.items():
        seats = room.get('seats', [])
        summary = room.get('summary', {})
        capacity = room.get('capacity', 0)
        
        if capacity == 0 or not seats:
            continue
            
        if not first_page:
            doc.showPage()
        else:
            first_page = False
        
        # --- 1. Draw Headers (as in your PDF) ---
        doc.setFont('Helvetica-Bold', 12)
        doc.drawCentredString(width / 2, height - 0.5*inch, "GALGOTIAS COLLEGE OF ENGINEERING & TECHNOLOGY, GREATER NOIDA")
        doc.setFont('Helvetica', 10)
        doc.drawCentredString(width / 2, height - 0.75*inch, "CONTINUOUS ASSESSMENT EXAM-I, OСT- 2025, В.ТЕCH, MBA, MCA 2025-2026 ODD")
        doc.drawCentredString(width / 2, height - 0.95*inch, "I, III & V-Semester Seating Plan (06 to 18 Oct 2025, -Evening)")
        
        # --- 2. Draw Room Info ---
        total_in_room = sum(summary.values())
        doc.setFont('Helvetica-Bold', 14)
        doc.drawString(0.5*inch, height - 1.5*inch, room_name)
        doc.drawRightString(width - 0.5*inch, height - 1.5*inch, f"Total Students: {total_in_room}")
        
        # --- 3. Draw White Board line ---
        doc.setFont('Helvetica', 10)
        doc.drawCentredString(width / 2, height - 1.8*inch, "个个个个个个个个个个个_White Board_个个个个个个个个个个个")
        
        # --- 4. Draw Multi-Column Table ---
        # This logic creates 3 columns, as in room D-007 [cite: 5]
        num_columns = 3
        col_width = (width - 1*inch) / num_columns
        rows_per_col = math.ceil(capacity / num_columns)
        
        # Column Headers
        doc.setFont('Helvetica-Bold', 9)
        for c in range(num_columns):
            x_seat = 0.5*inch + (c * col_width)
            x_s1 = x_seat + 0.3*inch
            x_s2 = x_seat + 1.2*inch
            
            y_pos = height - 2.2*inch
            doc.drawString(x_seat, y_pos, "Seat No.")
            doc.drawString(x_s1, y_pos, "Roll Series 1.")
            doc.drawString(x_s2, y_pos, "Roll Series 2.")
        
        # Table Content
        doc.setFont('Helvetica', 9)
        row_height = 0.4*inch
        
        for i, seat in enumerate(seats):
            col = i // rows_per_col
            row = i % rows_per_col
            
            x_seat = 0.5*inch + (col * col_width)
            x_s1 = x_seat + 0.3*inch
            x_s2 = x_seat + 1.2*inch
            y = (height - 2.5*inch) - (row * row_height)
            
            # Seat Number
            doc.drawString(x_seat, y, str(seat['seat_num']))
            
            # Student 1
            if seat['student_1']:
                s = seat['student_1']
                doc.drawString(x_s1, y, s['roll'])
                doc.setFont('Helvetica-Oblique', 8)
                doc.setFillColorRGB(0.3, 0.3, 0.3)
                doc.drawString(x_s1, y - 0.15*inch, s['group'])
                doc.setFont('Helvetica', 9)
                doc.setFillColorRGB(0, 0, 0)
            
            # Student 2
            if seat['student_2']:
                s = seat['student_2']
                doc.drawString(x_s2, y, s['roll'])
                doc.setFont('Helvetica-Oblique', 8)
                doc.setFillColorRGB(0.3, 0.3, 0.3)
                doc.drawString(x_s2, y - 0.15*inch, s['group'])
                doc.setFont('Helvetica', 9)
                doc.setFillColorRGB(0, 0, 0)
        
        # --- 5. Draw Summary Footer ---
        doc.setFont('Helvetica-Bold', 10)
        summary_y = (height - 2.8*inch) - (rows_per_col * row_height)
        doc.drawString(0.5*inch, summary_y, "Branch & Students:")
        summary_text = "  |  ".join([f"{group} = {count}" for group, count in summary.items()])
        doc.setFont('Helvetica', 9)
        doc.drawString(0.5*inch, summary_y - 0.2*inch, summary_text)

    doc.save()
    buffer.seek(0)
    return buffer

# --- 4. The API Endpoints ---
@app.route('/process-file', methods=['POST'])
def process_file_endpoint():
    try:
        if 'studentFile' not in request.files:
            return jsonify({'message': 'No "studentFile" found'}), 400
        
        file = request.files['studentFile']
        room_list = flask.json.loads(request.form['roomList'])
        
        students = parse_student_file(file.stream, file.mimetype)
        if not students:
            return jsonify({'message': 'Could not parse any students from file'}), 400
            
        plan_data, unassigned = create_roll_series_plan(students, room_list)
        
        return jsonify({
            'success': True,
            'planData': plan_data,
            'studentCount': len(students),
            'roomList': room_list,
            'unassignedCount': unassigned
        })
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/generate-pdf', methods=['POST'])
def generate_pdf_endpoint():
    try:
        plan_data = request.json['planData']
        pdf_buffer = generate_pdf_from_plan(plan_data)
        
        return Response(
            pdf_buffer,
            mimetype='application/pdf',
            headers={'Content-Disposition': 'attachment;filename=Seating_Plan.pdf'}
        )
    except Exception as e:
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8081)