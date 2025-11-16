import flask
from flask import Flask, request, jsonify, Response
import pandas as pd
import io
import math
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors

app = Flask(__name__)

# --- Helper function to split roll/branch ---
def split_roll_branch(s):
    if not s or not isinstance(s, str):
        return "", ""
    parts = s.strip().split(maxsplit=1)
    roll = parts[0] if parts else ""
    branch = parts[1] if len(parts) > 1 else ""
    return roll, branch

# --- This function builds the PDF from the logic ---
@app.route('/generate-pdf-from-logic', methods=['POST'])
def generate_pdf_from_logic():
    try:
        data = request.json
        rooms = data['rooms']
        assigned_data = data['assignedData']
        
        buffer = io.BytesIO()
        doc = canvas.Canvas(buffer, pagesize=A4, bottomup=0) # top-down
        width, height = A4
        first_page = True

        for room in rooms:
            room_name = room['name']
            room_rows = int(room['rows'])
            room_cols = int(room['cols']) # Benches
            
            room_info = assigned_data.get(room_name)
            if not room_info:
                continue # Skip rooms that weren't assigned

            pairs_assigned = room_info.get('pairs', [])
            branch_summary = room_info.get('summary', {})
            
            if not first_page:
                doc.showPage()
            else:
                first_page = False
                
            y = 0.5 * inch # Start drawing from the top

            # --- 1. Draw Headers ---
            doc.setFont('Helvetica-Bold', 12)
            doc.drawCentredString(width / 2, y + 0.1*inch, room['college'].upper())
            y += 0.2*inch
            doc.setFont('Helvetica', 9)
            doc.drawCentredString(width / 2, y + 0.1*inch, room['exam'])
            y += 0.15*inch
            doc.drawCentredString(width / 2, y + 0.1*inch, "Seating Plan")
            y += 0.3*inch
            
            # --- 2. Draw Room Info ---
            total_students = sum(branch_summary.values())
            doc.setFont('Helvetica-Bold', 16)
            doc.drawString(0.5*inch, y + 0.1*inch, room_name)
            doc.setFont('Helvetica-Bold', 14)
            doc.drawRightString(width - 0.5*inch, y + 0.1*inch, f"Total Students: {total_students}")
            y += 0.3*inch
            
            # --- 3. Draw White Board line ---
            doc.setFont('Helvetica', 10)
            doc.drawCentredString(width / 2, y + 0.1*inch, "↑ ↑ ↑ ↑ ↑ ↑ Black Board ↑ ↑ ↑ ↑ ↑ ↑")
            y += 0.4*inch
            
            # --- 4. Draw Grid ---
            total_excel_cols = room_cols * 2
            col_width = (width - 1*inch) / total_excel_cols # Width for one student cell
            row_height = 0.5 * inch # Height for 2 lines of text
            
            assigned_index = 0
            for r in range(room_rows):
                for c_bench in range(room_cols):
                    excel_col_left = c_bench * 2
                    excel_col_right = excel_col_left + 1
                    
                    x_left = 0.5*inch + (excel_col_left * col_width)
                    x_right = 0.5*inch + (excel_col_right * col_width)
                    y_pos = y + (r * row_height)
                    
                    # Draw borders
                    doc.setStrokeColorRGB(0.7, 0.7, 0.7) # Dashed border
                    doc.setDash(1, 2)
                    doc.rect(x_left, y_pos, col_width, row_height, stroke=1, fill=0)
                    doc.rect(x_right, y_pos, col_width, row_height, stroke=1, fill=0)
                    doc.setDash() # Reset dash
                    
                    if assigned_index < len(pairs_assigned):
                        pair = pairs_assigned[assigned_index]
                        r1, b1 = split_roll_branch(pair['s1'])
                        r2, b2 = split_roll_branch(pair['s2'])
                        
                        # Draw Student 1 (left)
                        doc.setFont('Helvetica-Bold', 9)
                        doc.setFillColorRGB(0, 0, 0)
                        doc.drawString(x_left + 5, y_pos + 0.15*inch, r1)
                        doc.setFont('Helvetica-Oblique', 8)
                        doc.setFillColorRGB(0.3, 0.3, 0.3)
                        doc.drawString(x_left + 5, y_pos + 0.3*inch, b1)
                        
                        # Draw Student 2 (right)
                        doc.setFont('Helvetica-Bold', 9)
                        doc.setFillColorRGB(0, 0, 0)
                        doc.drawString(x_right + 5, y_pos + 0.15*inch, r2)
                        doc.setFont('Helvetica-Oblique', 8)
                        doc.setFillColorRGB(0.3, 0.3, 0.3)
                        doc.drawString(x_right + 5, y_pos + 0.3*inch, b2)

                    assigned_index += 1

            # --- 5. Draw Summary Footer ---
            y_footer = y + (room_rows * row_height) + 0.2*inch
            if y_footer > height - (1.5 * inch):
                 y_footer = height - (1.5 * inch)
                 
            doc.setStrokeColorRGB(0,0,0)
            doc.rect(0.5*inch, y_footer, 3*inch, 0.25*inch)
            doc.rect(0.5*inch, y_footer + 0.25*inch, 3*inch, (len(branch_summary) * 0.2*inch))
            
            doc.setFont('Helvetica-Bold', 9)
            doc.drawString(0.5*inch + 5, y_footer + 0.15*inch, "Branch Name")
            doc.drawString(2*inch, y_footer + 0.15*inch, "No. of Students")
            
            y_summary = y_footer + 0.4*inch
            doc.setFont('Helvetica', 9)
            for branch, count in branch_summary.items():
                doc.drawString(0.5*inch + 5, y_summary, branch)
                doc.drawString(2*inch, y_summary, str(count))
                y_summary += 0.2*inch

        doc.save()
        buffer.seek(0)
        return Response(
            buffer,
            mimetype='application/pdf',
            headers={'Content-Disposition': 'attachment;filename=Seating_Plan.pdf'}
        )
    except Exception as e:
        print(f"Error in /generate-pdf-from-logic: {e}")
        return jsonify({'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8081)