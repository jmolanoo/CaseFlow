import os
import datetime
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
import openpyxl

base_output = '/workspaces/CaseFlow/02_DOCUMENTACION_DILIGENCIADA'

print("=== ACTUALIZANDO FORMATOS PMO PARA SPRINT 4 ===")

# 1. ACTUALIZAR PLAN DE PRUEBAS DE SOFTWARE (DOCX)
def update_plan_pruebas_sprint4():
    dst = os.path.join(base_output, 'CF - PMO-Plan de Pruebas de Software.docx')
    if not os.path.exists(dst):
        print(f"File not found: {dst}")
        return
    doc = docx.Document(dst)

    # Actualizar historial de revisiones en tabla 0
    t0 = doc.tables[0]
    row = t0.add_row().cells
    row[0].text = '03/11/2026'
    row[1].text = '4.0'
    row[2].text = 'Danna Nerieth Palencia & Jairo Molano Salgado'
    row[3].text = 'Equipo de Ingenieria CaseFlow'
    row[4].text = 'Cierre Sprint 4: Invitaciones Custom Multi-Rol, Gestion de Miembros y Boveda BYOK Aislada'

    doc.add_page_break()
    doc.add_heading("Estrategia y Cobertura de Pruebas de Software — Sprint 4 (Hardening, Invitaciones y BYOK Aislado)", level=1)

    sec_content = [
        ("1. Alcance y Nuevas Funcionalidades Validadas en Sprint 4",
         "El Sprint 4 implementa y consolida las siguientes arquitecturas y modulos:\n"
         "• Sistema de Enlaces de Invitacion Personalizados Multi-Rol: Generacion de enlaces custom con rol predeterminado (Usuario/Solicitante, Soporte/Agente, Administrador), etiquetas descriptivas, limites de uso y vigencia temporal.\n"
         "• Incorporacion Fluida y Conmutacion de Mesas: Pantalla de inicio 'Mis Mesas de Ayuda' simplificada, eliminando la conexion global de IA y facilitando la union a mesas existentes mediante links o codigos de invitacion.\n"
         "• Gestion Integral de Miembros (User Management): Panel de administracion por mesa que permite cambiar roles en tiempo real, desactivar o reactivar miembros (bloqueando acceso sin perder trazabilidad) y remover miembros, protegiendo al propietario y a los administradores unicos.\n"
         "• Boveda BYOK Aislada a Nivel de Mesa (Tenant-Isolated AI Vault): Migracion de claves de IA al contexto estricto de cada mesa de ayuda, permitiendo operar con distintos proveedores (Gemini, Claude, OpenAI) y distintas API keys por mesa con cifrado AES-256."),

        ("2. Metricas Oficiales de Calidad y Cobertura Certificada",
         "• Total de Pruebas Automatizadas: 25 tests unitarios e integrados pasando al 100% (0 errores).\n"
         "• Cobertura de Codigo: 86% sobre 1,273 sentencias de logica en FastAPI.\n"
         "• Frontend SPA: Compilacion de produccion con Vite y TypeScript con 0 errores (3.37s).\n"
         "• Despliegue: Contenedores Docker multi-stage (Backend FastAPI + Frontend Nginx) con healthchecks activos."),
    ]

    for title, text in sec_content:
        doc.add_heading(title, level=2)
        doc.add_paragraph(text)

    # Tabla de pruebas Sprint 4
    doc.add_heading("Matriz de Nuevos Casos de Prueba Ejecutados en Sprint 4", level=2)
    t_s4 = doc.add_table(rows=9, cols=5)
    t_s4.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["ID Caso", "Modulo Evaluado", "Tipo de Prueba", "Resultado Verificado", "Estado"]
    for j, h in enumerate(headers):
        t_s4.rows[0].cells[j].text = h

    test_runs_s4 = [
        ("CP-31", "Invitaciones Custom Usuario", "Invitaciones / Auth", "Generacion de enlace con rol 'requester' y max_uses", "Aprobado (100%)"),
        ("CP-32", "Invitaciones Custom Soporte", "Invitaciones / Auth", "Generacion de enlace con rol 'agent' para soporte TI", "Aprobado (100%)"),
        ("CP-33", "Union a Mesa via Link", "Multi-Tenant / Join", "Usuario 2 ingresa como Solicitante con exito", "Aprobado (100%)"),
        ("CP-34", "Union a Mesa como Agente", "Multi-Tenant / Join", "Usuario 3 ingresa como Soporte / Agente con exito", "Aprobado (100%)"),
        ("CP-35", "Cambio de Rol de Miembro", "Admin / RBAC", "Admin promueve Solicitante a Agente en tiempo real", "Aprobado (100%)"),
        ("CP-36", "Desactivacion y Bloqueo 403", "Seguridad / Miembros", "Miembro desactivado recibe 403 y no ve la mesa", "Aprobado (100%)"),
        ("CP-37", "Proteccion Propietario Mesa", "Seguridad / Guards", "Rechazo de degradacion o remocion del Owner (400)", "Aprobado (100%)"),
        ("CP-38", "Aislamiento BYOK por Mesa", "IA / Criptografia", "Mesa Alfa (Gemini) y Mesa Beta (OpenAI) 100% aisladas", "Aprobado (100%)"),
    ]

    for i, (cid, mod, typ, res, est) in enumerate(test_runs_s4, start=1):
        row = t_s4.rows[i].cells
        row[0].text = cid
        row[1].text = mod
        row[2].text = typ
        row[3].text = res
        row[4].text = est

    doc.save(dst)
    print("-> CF - PMO-Plan de Pruebas de Software.docx actualizado para Sprint 4")

# 2. ACTUALIZAR INFORME DE PRUEBAS DE SOFTWARE (DOCX)
def update_informe_pruebas_sprint4():
    dst = os.path.join(base_output, 'CF - Informe-Pruebas-SW.docx')
    if not os.path.exists(dst):
        print(f"File not found: {dst}")
        return
    doc = docx.Document(dst)

    # Actualizar historial
    t0 = doc.tables[0]
    row = t0.add_row().cells
    row[0].text = '4.0'
    row[1].text = '03/11/2026'
    row[2].text = 'Danna Nerieth Palencia & Jairo Molano Salgado'
    row[3].text = 'Cierre Sprint 4: Auditoria de Invitaciones, Gestion de Usuarios y Boveda BYOK Aislada'

    doc.add_page_break()
    doc.add_heading("Informe de Ejecucion y Resultados de Pruebas — Sprint 4", level=1)

    p1 = doc.add_paragraph()
    p1.add_run("Resumen Ejecutivo de Calidad:\n").bold = True
    p1.add_run(
        "Durante el Sprint 4 se verifico la reestructuracion del panel principal, el sistema de invitaciones personalizadas con roles predeterminados, la administracion granular de miembros y el aislamiento riguroso de claves API de IA por mesa de ayuda. "
        "La suite automatizada ejecuto 25 pruebas en pytest alcanzando un 86% de cobertura de codigo sobre 1,273 declaraciones ejecutables sin ningun fallo."
    )

    doc.add_heading("Resumen Cuantitativo de Pruebas — Sprint 4", level=2)
    t_summary = doc.add_table(rows=6, cols=3)
    t_summary.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Metrica de Evaluacion", "Valor Obtenido", "Criterio de Calidad"]
    for j, h in enumerate(headers):
        t_summary.rows[0].cells[j].text = h

    data = [
        ("Total de Pruebas Automatizadas", "25 pruebas", "100% pasando"),
        ("Tasa de Exito", "100.0%", "Minimo 95%"),
        ("Defectos Abiertos", "0 defectos", "0 defectos criticos"),
        ("Cobertura de Codigo Backend", "86% (1,092 / 1,273 sentencias)", "Supera el 80% exigido"),
        ("Compilacion Frontend Vite/React", "Exitosa (0 errores TS)", "Bundle de produccion listo")
    ]
    for i, (m, v, c) in enumerate(data, start=1):
        row = t_summary.rows[i].cells
        row[0].text = m
        row[1].text = v
        row[2].text = c

    doc.save(dst)
    print("-> CF - Informe-Pruebas-SW.docx actualizado para Sprint 4")

# 3. ACTUALIZAR CASOS DE PRUEBA EN EXCEL
def update_casos_prueba_excel():
    dst = os.path.join(base_output, 'CF - PMO- Casos de Prueba.xls.xlsx')
    if not os.path.exists(dst):
        print(f"File not found: {dst}")
        return
    wb = openpyxl.load_workbook(dst)
    ws = wb.active

    s4_cases = [
        ('CP-31', 'Creacion de enlace de invitacion para usuarios', 'POST /desks/{slug}/invitations con rol requester', '03/11/2026', 'Invitaciones', 'Custom Links', 'Status 201 + Link generado con rol requester', 'Status 201 + Enlace creado', 'Aprobado'),
        ('CP-32', 'Creacion de enlace de invitacion para agentes', 'POST /desks/{slug}/invitations con rol agent', '03/11/2026', 'Invitaciones', 'Custom Links', 'Status 201 + Link generado con rol agent', 'Status 201 + Enlace creado', 'Aprobado'),
        ('CP-33', 'Union a mesa de ayuda via enlace como usuario', 'POST /desks/join ingresando codigo de invitacion', '03/11/2026', 'Membresia', 'Join Desk', 'Status 200 + Usuario incorporado con rol requester', 'Status 200 + Incorporacion exitosa', 'Aprobado'),
        ('CP-34', 'Union a mesa de ayuda via enlace como agente', 'POST /desks/join ingresando codigo de soporte', '03/11/2026', 'Membresia', 'Join Desk', 'Status 200 + Usuario incorporado con rol agent', 'Status 200 + Incorporacion exitosa', 'Aprobado'),
        ('CP-35', 'Modificacion de rol de miembro por el Administrador', 'PATCH /desks/{slug}/members/{user_id} rol agent', '03/11/2026', 'Gestion de Miembros', 'Roles RBAC', 'Status 200 + Rol actualizado en BD', 'Status 200 + Rol modificado', 'Aprobado'),
        ('CP-36', 'Desactivacion de miembro y restriccion de acceso', 'PATCH /desks/{slug}/members/{user_id} is_active=False', '03/11/2026', 'Seguridad', 'Suspension de Acceso', 'Status 200 + Bloqueo 403 Forbidden a rutas de la mesa', 'Status 403 retornado al acceder', 'Aprobado'),
        ('CP-37', 'Proteccion de seguridad para Propietario de la mesa', 'PATCH /members intentando desactivar o demote al Owner', '03/11/2026', 'Seguridad', 'Guards de Integridad', 'Status 400 Bad Request protegiendo al Owner', 'Status 400 retornado', 'Aprobado'),
        ('CP-38', 'Aislamiento de credenciales BYOK por mesa de ayuda', 'POST /ai/vault/connect especificando desk_slug', '03/11/2026', 'Boveda BYOK', 'Aislamiento Multi-Tenant', 'Status 200 + Claves de API independientes por mesa', 'Status 200 + Aislamiento verificado', 'Aprobado'),
    ]

    for c in s4_cases:
        row_vals = [c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7], c[8]] + [None]*17
        ws.append(row_vals)

    wb.save(dst)
    print("-> CF - PMO- Casos de Prueba.xls.xlsx actualizado para Sprint 4")

# 4. ACTUALIZAR REPORTE DE ERRORES EN EXCEL
def update_reporte_errores_sprint4():
    dst = os.path.join(base_output, 'CF - Reporte_Errores_SW.xlsx')
    if not os.path.exists(dst):
        print(f"File not found: {dst}")
        return
    wb = openpyxl.load_workbook(dst)
    ws = wb.active

    s4_defects = [
        ("DEF-16", "Conexion global de IA generaba colision de API keys entre distintas mesas de ayuda", "Arquitectura / BYOK", "Alta", "Cerrado / Resuelto", "Danna Palencia & Jairo Molano", "03/11/2026", "Se reubico la boveda BYOK al interior de cada mesa de ayuda, soportando claves independientes por espacio de trabajo con modelo UserAICredential asociado a help_desk_id."),
        ("DEF-17", "Imposibilidad de incorporar colaboradores con roles diferenciados de forma autonoma", "Gestion / Invitaciones", "Alta", "Cerrado / Resuelto", "Danna Palencia & Jairo Molano", "03/11/2026", "Se desarrollo el sistema de enlaces de invitacion custom multi-rol (HelpDeskInvitation) y endpoint /desks/join con preview y limites configurables."),
        ("DEF-18", "Carencia de panel de administracion de usuarios para suspender o cambiar roles en la mesa", "Seguridad / Miembros", "Media", "Cerrado / Resuelto", "Danna Palencia & Jairo Molano", "03/11/2026", "Se implemento la pestana Usuarios e Invitaciones con listado reactivo, selector de roles en tiempo real y toggle de activacion/desactivacion.")
    ]

    for err in s4_defects:
        ws.append(err)

    wb.save(dst)
    print("-> CF - Reporte_Errores_SW.xlsx actualizado para Sprint 4")

# 5. ACTUALIZAR DOCUMENTO DE REQUERIMIENTOS (DOCX)
def update_requerimientos_sprint4():
    dst = os.path.join(base_output, 'CF - PMOI-Documento de requerimientos.docx')
    if not os.path.exists(dst):
        print(f"File not found: {dst}")
        return
    doc = docx.Document(dst)

    doc.add_page_break()
    doc.add_heading("Nuevos Requerimientos Funcionales Incorporados — Sprint 4", level=1)

    rfs = [
        ("RF-18: Sistema de Enlaces de Invitacion Personalizados Multi-Rol",
         "El sistema permitira al Administrador de una Mesa de Ayuda generar multiples enlaces de invitacion customizables, asociando a cada enlace un rol predeterminado ('requester', 'agent', 'admin'), una etiqueta descriptiva, limites de uso y tiempos de caducidad."),
        ("RF-19: Incorporacion Fluida por Invitacion (Join Desk Flow)",
         "Los usuarios finales podran incorporarse a una mesa de ayuda mediante el ingreso de un enlace o codigo de invitacion. El sistema validara la vigencia del enlace, asignara automaticamente el rol configurado y actualizara el catalogo de miembros."),
        ("RF-20: Gestion Integral de Miembros por Mesa de Ayuda",
         "El Administrador podra listar todos los miembros de la mesa de ayuda, modificar sus roles en tiempo real, desactivar o reactivar cuentas para suspender accesos sin perder historico de tickets, y remover miembros (con proteccion para el propietario y el administrador unico)."),
        ("RF-21: Boveda BYOK Aislada a Nivel de Mesa de Ayuda",
         "La configuracion y almacenamiento de claves de API (Gemini, Claude, OpenAI) se gestionara de manera independiente dentro de cada mesa de ayuda, permitiendo a los usuarios y administradores operar con distintas API keys y modelos por mesa, aisladas con cifrado AES-256."),
        ("RF-22: Panel Principal de Mesas de Ayuda Desacoplado",
         "El dashboard central del usuario se simplificara como un centro de acceso y conmutacion entre sus mesas de ayuda vinculadas, eliminando la configuracion global de IA y proveyendo acceso directo para crear o unirse a nuevas mesas mediante enlaces.")
    ]

    for title, desc in rfs:
        doc.add_heading(title, level=2)
        doc.add_paragraph(desc)

    doc.save(dst)
    print("-> CF - PMOI-Documento de requerimientos.docx actualizado para Sprint 4")

# 6. ACTUALIZAR CASOS DE USO (DOCX)
def update_casos_uso_sprint4():
    dst = os.path.join(base_output, 'CF - PMO-Casos de Uso.docx')
    if not os.path.exists(dst):
        print(f"File not found: {dst}")
        return
    doc = docx.Document(dst)

    doc.add_page_break()
    doc.add_heading("Especificacion de Casos de Uso — Sprint 4 (Miembros, Invitaciones y BYOK)", level=1)

    cus = [
        ("CU-11: Administrar Miembros y Roles de la Mesa de Ayuda",
         "**Actor Principal:** Administrador de la Mesa.\n"
         "**Precondiciones:** El administrador debe haber iniciado sesion y pertenecer activamente a la mesa.\n"
         "**Flujo Principal:**\n"
         "1. El administrador ingresa a la pestana 'Usuarios e Invitaciones' en el espacio de trabajo.\n"
         "2. El sistema despliega el directorio de miembros con su nombre, correo, rol y estado.\n"
         "3. El administrador selecciona un nuevo rol (Usuario, Soporte, Administrador) para un miembro.\n"
         "4. El sistema actualiza el registro en la base de datos y confirma el cambio.\n"
         "5. El administrador puede conmutar el estado del usuario (Desactivar/Reactivar).\n"
         "**Flujos Alternativos:**\n"
         "• 4a. Si el usuario seleccionado es el Propietario de la mesa, el sistema impide la degradacion de rol o desactivacion notificando la restriccion."),
        
        ("CU-12: Generar Enlaces de Invitacion Personalizados",
         "**Actor Principal:** Administrador de la Mesa.\n"
         "**Flujo Principal:**\n"
         "1. El administrador hace clic en '+ Crear Enlace de Invitacion'.\n"
         "2. Selecciona el rol a otorgar (Usuario / Solicitante o Soporte / Agente), ingresa una etiqueta descriptiva y define limites opcionales de uso o caducidad.\n"
         "3. Hace clic en 'Crear Enlace'. El sistema genera un token seguro unico y almacena el enlace.\n"
         "4. El administrador copia el enlace generado con un clic para compartirlo con su personal."),

        ("CU-13: Unirse a Mesa de Ayuda mediante Codigo de Invitacion",
         "**Actor Principal:** Usuario / Agente de Soporte.\n"
         "**Flujo Principal:**\n"
         "1. El usuario hace clic en 'Unirme a una Mesa' en el panel principal o abre una URL de invitacion.\n"
         "2. Pega o ingresa el codigo de invitacion.\n"
         "3. El sistema valida la invitacion y previsualiza la mesa destino y el rol otorgado.\n"
         "4. El usuario confirma 'Unirme a la Mesa'.\n"
         "5. El sistema registra la membresia activa con el rol preconfigurado y redirige a la mesa."),

        ("CU-14: Configurar Boveda BYOK por Mesa de Ayuda",
         "**Actor Principal:** Administrador / Usuario de la Mesa.\n"
         "**Flujo Principal:**\n"
         "1. El usuario navega a la pestana 'Conexion de IA (BYOK)' dentro de la mesa de ayuda especifica.\n"
         "2. Selecciona el proveedor (Gemini, Claude, OpenAI) e ingresa su API key privada.\n"
         "3. El sistema valida la conectividad en tiempo real y mide la latencia.\n"
         "4. Las credenciales se cifran con AES-256 y se asocian de manera exclusiva a esa mesa de ayuda.")
    ]

    for title, desc in cus:
        doc.add_heading(title, level=2)
        doc.add_paragraph(desc)

    doc.save(dst)
    print("-> CF - PMO-Casos de Uso.docx actualizado para Sprint 4")

# 7. ACTUALIZAR HISTORIAS DE USUARIO EN EXCEL
def update_historias_usuario_excel():
    dst = os.path.join(base_output, 'CF - Historias Usuario.xls.xlsx')
    if not os.path.exists(dst):
        print(f"File not found: {dst}")
        return
    wb = openpyxl.load_workbook(dst)
    ws = wb.active

    s4_hus = [
        ('HU-13', 'Creacion de enlaces de invitacion custom', 'Como Administrador de la mesa, quiero generar enlaces de invitacion con roles predeterminados para incorporar usuarios y agentes de soporte de forma autonoma.', 'Sprint 4', 'Alta', 'Aprobado', 'Dado que soy admin de la mesa, Cuando creo un link con rol Agente y etiqueta Soporte TI, Entonces se genera un codigo unico y se persiste en BD.'),
        ('HU-14', 'Incorporacion a mesa mediante enlace de invitacion', 'Como empleado u operador, quiero unirme a una mesa pegando mi enlace de invitacion para obtener acceso inmediato con mis permisos asignados.', 'Sprint 4', 'Alta', 'Aprobado', 'Dado que tengo un link valido, Cuando lo ingreso en Unirme a una Mesa, Entonces el sistema valida el token y me incorpora con el rol de la invitacion.'),
        ('HU-15', 'Gestion integral de miembros y roles', 'Como Administrador de la mesa, quiero cambiar roles y suspender miembros para mantener la seguridad y control del espacio de trabajo.', 'Sprint 4', 'Alta', 'Aprobado', 'Dado que visualizo el directorio de miembros, Cuando desactivo a un usuario, Entonces sus peticiones futuras reciben 403 Forbidden inmediatamente.'),
        ('HU-16', 'Boveda BYOK aislada por mesa de ayuda', 'Como usuario o administrador, quiero configurar API keys independientes por mesa de ayuda para separar costos y modelos de IA.', 'Sprint 4', 'Alta', 'Aprobado', 'Dado que estoy en Mesa Alfa con Gemini y configuro Mesa Beta con OpenAI, Cuando opero en cada mesa, Entonces cada una utiliza su clave de API aislada.')
    ]

    for h in s4_hus:
        row_vals = [h[0], h[1], h[2], h[3], h[4], h[5], h[6]] + [None]*10
        ws.append(row_vals)

    wb.save(dst)
    print("-> CF - Historias Usuario.xls.xlsx actualizado para Sprint 4")

if __name__ == '__main__':
    update_plan_pruebas_sprint4()
    update_informe_pruebas_sprint4()
    update_casos_prueba_excel()
    update_reporte_errores_sprint4()
    update_requerimientos_sprint4()
    update_casos_uso_sprint4()
    update_historias_usuario_excel()
    print("=== TODOS LOS FORMATOS PMO DE SPRINT 4 ACTUALIZADOS EXITOSAMENTE ===")
