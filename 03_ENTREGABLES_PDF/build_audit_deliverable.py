import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

md_path = '/workspaces/CaseFlow/informe_auditoria_roles_calidad.md'
docx_path = '/workspaces/CaseFlow/03_ENTREGABLES_PDF/Informe_Auditoria_Roles_y_Calidad_CaseFlow.docx'

doc = docx.Document()

# Margins
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# Cover Title
title_p = doc.add_paragraph()
title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_run = title_p.add_run("CASEFLOW")
title_run.font.name = "Arial"
title_run.font.size = Pt(26)
title_run.font.bold = True
title_run.font.color.rgb = RGBColor(244, 63, 94) # Rose 500

sub_p = doc.add_paragraph()
sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
sub_run = sub_p.add_run("Informe Oficial de Auditoría Técnica, Alineación de Permisos RBAC y Puerta de Calidad")
sub_run.font.name = "Arial"
sub_run.font.size = Pt(13)
sub_run.font.italic = True
sub_run.font.color.rgb = RGBColor(113, 113, 122)

# Divider
doc.add_paragraph("—" * 40).alignment = WD_ALIGN_PARAGRAPH.CENTER

# Metadata Card
meta_p = doc.add_paragraph()
meta_p.paragraph_format.space_after = Pt(14)
meta_lines = [
    ("Plataforma:", " CaseFlow — Multi-Tenant Help Desk con Arquitectura BYOK AI"),
    ("Docente Supervisor & Product Owner:", " Ing. Eduardo Martínez Vidal"),
    ("Equipo de Ingeniería:", " Danna Nerieth Palencia & Jairo Molano Salgado"),
    ("Modalidad de Trabajo:", " Co-desarrollo e Ingeniería Conjunta (Sin asignación jerárquica)"),
    ("Fecha de Auditoría:", " 04 de noviembre de 2026"),
    ("Veredicto de Calidad:", " [VEREDICTO: APROBADO 100%]"),
]
for label, val in meta_lines:
    r1 = meta_p.add_run(f"• {label}")
    r1.font.bold = True
    r1.font.size = Pt(10.5)
    r2 = meta_p.add_run(f"{val}\n")
    r2.font.size = Pt(10.5)

doc.add_page_break()

# Read markdown content
with open(md_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_table = False
table_data = []

for line in lines:
    line_str = line.strip()
    if not line_str:
        continue
    if line_str.startswith('# CaseFlow — Informe') or line_str.startswith('**Documento') or line_str.startswith('**Proyecto:') or line_str.startswith('**Equipo') or line_str.startswith('**Docente') or line_str.startswith('**Fecha') or line_str.startswith('**Versión'):
        continue
    if line_str == '---':
        continue

    # Tables in markdown
    if line_str.startswith('|') and line_str.endswith('|'):
        parts = [p.strip() for p in line_str.split('|')[1:-1]]
        if all(set(p) <= {'-', ':', ' '} for p in parts):
            continue
        table_data.append(parts)
        in_table = True
        continue
    else:
        if in_table and table_data:
            num_rows = len(table_data)
            num_cols = len(table_data[0])
            t = doc.add_table(rows=num_rows, cols=num_cols)
            t.alignment = WD_TABLE_ALIGNMENT.CENTER
            for r_idx, row in enumerate(table_data):
                for c_idx, cell_text in enumerate(row):
                    if c_idx < num_cols:
                        cell = t.rows[r_idx].cells[c_idx]
                        clean_t = cell_text.replace('**', '').replace('`', '')
                        cell.text = clean_t
                        if r_idx == 0:
                            for p in cell.paragraphs:
                                for r in p.runs:
                                    r.font.bold = True
                                    r.font.size = Pt(9.5)
                        else:
                            for p in cell.paragraphs:
                                for r in p.runs:
                                    r.font.size = Pt(9)
            doc.add_paragraph()
            in_table = False
            table_data = []

    if line_str.startswith('## '):
        h = doc.add_heading(line_str.replace('## ', ''), level=1)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
    elif line_str.startswith('### '):
        h = doc.add_heading(line_str.replace('### ', ''), level=2)
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(4)
    elif line_str.startswith('#### '):
        h = doc.add_heading(line_str.replace('#### ', ''), level=3)
    elif line_str.startswith('- ') or line_str.startswith('• '):
        p = doc.add_paragraph(style='List Bullet')
        clean_text = line_str[2:].replace('**', '').replace('`', '')
        p.add_run(clean_text).font.size = Pt(10)
    elif line_str.startswith('1. ') or line_str.startswith('2. ') or line_str.startswith('3. '):
        p = doc.add_paragraph()
        clean_text = line_str.replace('**', '').replace('`', '')
        p.add_run(clean_text).font.size = Pt(10)
    elif line_str.startswith('```'):
        continue
    else:
        p = doc.add_paragraph()
        clean_text = line_str.replace('**', '').replace('`', '')
        p.add_run(clean_text).font.size = Pt(10)

if in_table and table_data:
    num_rows = len(table_data)
    num_cols = len(table_data[0])
    t = doc.add_table(rows=num_rows, cols=num_cols)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r_idx, row in enumerate(table_data):
        for c_idx, cell_text in enumerate(row):
            if c_idx < num_cols:
                cell = t.rows[r_idx].cells[c_idx]
                cell.text = cell_text.replace('**', '').replace('`', '')
                if r_idx == 0:
                    for p in cell.paragraphs:
                        for r in p.runs:
                            r.font.bold = True
                            r.font.size = Pt(9.5)

doc.save(docx_path)
print(f"-> Documento guardado exitosamente en: {docx_path}")
