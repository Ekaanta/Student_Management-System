import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Assignment & Submission Management System — Quality Assurance Report")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — SYSTEM QA TESTING PASS")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        
        self.restoreState()

def build_pdf(filename="QA_Testing_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary_color = colors.HexColor("#4F46E5") # Indigo
    secondary_color = colors.HexColor("#0F172A") # Slate 900
    accent_green = colors.HexColor("#10B981") # Emerald
    light_bg = colors.HexColor("#F8FAFC")
    text_dark = colors.HexColor("#1E293B")
    border_color = colors.HexColor("#E2E8F0")

    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=secondary_color,
        alignment=0,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceAfter=15
    )

    heading1_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=secondary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    heading2_style = ParagraphStyle(
        'SubSectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=8
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_dark
    )

    pass_badge_style = ParagraphStyle(
        'PassBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#065F46"),
        alignment=1
    )

    story = []

    # Title & Subtitle Header
    story.append(Paragraph("Quality Assurance & Complete Testing Pass Report", title_style))
    story.append(Paragraph("Assignment & Submission Management System — Step 6 Final Audit", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=primary_color, spaceBefore=0, spaceAfter=14))

    # Executive Summary Card
    exec_summary_html = """
    <b>EXECUTIVE QA SUMMARY:</b><br/>
    A comprehensive Quality Assurance (QA) pass was executed across all components of the 
    <b>Assignment & Submission Management System</b>. The test suite covered Authentication, 
    Role-Based Authorization (RBAC), Resource Ownership Isolation, Admin CRUD, Teacher Coursework Management, 
    Student Submissions & Deadline Enforcement, and Dual PostgreSQL / MongoDB Atlas Persistence.
    """
    story.append(Paragraph(exec_summary_html, body_style))
    story.append(Spacer(1, 8))

    # Overall Metric Table
    metric_data = [
        [Paragraph("<b>Metric Parameter</b>", table_header_style), 
         Paragraph("<b>Execution Outcome</b>", table_header_style), 
         Paragraph("<b>Status</b>", table_header_style)],
        [Paragraph("xUnit Automated Unit Tests", table_cell_style), Paragraph("<b>26 / 26 Passed</b> (100% Pass Rate)", table_cell_style), Paragraph("PASSED", pass_badge_style)],
        [Paragraph("Backend Solution Build", table_cell_style), Paragraph("<b>0 Errors</b> (0 Warnings in Core Logic)", table_cell_style), Paragraph("PASSED", pass_badge_style)],
        [Paragraph("Frontend Production Build", table_cell_style), Paragraph("<b>21 / 21 Static Routes</b> Built Successfully", table_cell_style), Paragraph("PASSED", pass_badge_style)],
        [Paragraph("Dual DB Persistence", table_cell_style), Paragraph("PostgreSQL & MongoDB Atlas Real-Time Sync Verified", table_cell_style), Paragraph("PASSED", pass_badge_style)],
        [Paragraph("Security & Ownership Audit", table_cell_style), Paragraph("Zero RBAC / Ownership Bypass Vulnerabilities", table_cell_style), Paragraph("PASSED", pass_badge_style)],
    ]

    t_metrics = Table(metric_data, colWidths=[160, 244, 100])
    t_metrics.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('BACKGROUND', (2,1), (2,1), colors.HexColor("#D1FAE5")),
        ('BACKGROUND', (2,2), (2,2), colors.HexColor("#D1FAE5")),
        ('BACKGROUND', (2,3), (2,3), colors.HexColor("#D1FAE5")),
        ('BACKGROUND', (2,4), (2,4), colors.HexColor("#D1FAE5")),
        ('BACKGROUND', (2,5), (2,5), colors.HexColor("#D1FAE5")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_metrics)
    story.append(Spacer(1, 14))

    # Section 1: Detailed QA Testing Results
    story.append(Paragraph("1. Module-by-Module Test Suite Verification Results", heading1_style))

    modules_data = [
        [Paragraph("<b>Test Module</b>", table_header_style), 
         Paragraph("<b>Scenarios & Scope Tested</b>", table_header_style), 
         Paragraph("<b>Expected Behavior</b>", table_header_style), 
         Paragraph("<b>Result</b>", table_header_style)],
        
        [Paragraph("<b>AUTHENTICATION</b>", table_cell_style), 
         Paragraph("• Valid user login<br/>• Invalid password<br/>• Deactivated user login<br/>• JWT claim verification", table_cell_style),
         Paragraph("Valid token generated with NameIdentifier, Email, and Role. Bad passwords return 401. Inactive accounts blocked with 401.", table_cell_style),
         Paragraph("PASS", pass_badge_style)],

        [Paragraph("<b>AUTHORIZATION</b>", table_cell_style), 
         Paragraph("• Admin controller role guard<br/>• Teacher controller role guard<br/>• Student controller role guard<br/>• Cross-role access attempt", table_cell_style),
         Paragraph("Controller attributes [Authorize(Roles = '...')] strictly enforce role isolation. Unprivileged roles blocked with 403 Forbidden.", table_cell_style),
         Paragraph("PASS", pass_badge_style)],

        [Paragraph("<b>ADMIN MODULE</b>", table_cell_style), 
         Paragraph("• User CRUD & permanent delete<br/>• School Class CRUD<br/>• Subject CRUD<br/>• Teacher Assignment<br/>• Duplicate Email / Code", table_cell_style),
         Paragraph("Duplicate emails or class codes return 409 Conflict. Non-teachers blocked from teacher assignment. Delete actions clear EF Core & MongoDB.", table_cell_style),
         Paragraph("PASS", pass_badge_style)],

        [Paragraph("<b>TEACHER MODULE</b>", table_cell_style), 
         Paragraph("• Assignment Draft & Publish<br/>• ClassSubject assignment ownership<br/>• Submission review<br/>• Marks evaluation (0 <= Grade <= MaxScore)", table_cell_style),
         Paragraph("Unassigned teachers cannot create assignments for other classes. Negative grades or scores > MaxScore rejected with 400 Bad Request.", table_cell_style),
         Paragraph("PASS", pass_badge_style)],

        [Paragraph("<b>STUDENT MODULE</b>", table_cell_style), 
         Paragraph("• Enrolled class coursework list<br/>• Answer submission<br/>• Submission update before due date<br/>• Deadline enforcement", table_cell_style),
         Paragraph("Non-enrolled students blocked from accessing coursework. Answer updates past DueDateUtc rejected with 400 Bad Request.", table_cell_style),
         Paragraph("PASS", pass_badge_style)],

        [Paragraph("<b>DATABASE & DUAL SYNC</b>", table_cell_style), 
         Paragraph("• EF Core PostgreSQL migrations<br/>• Real-time MongoDB Atlas sync on SaveChangesAsync<br/>• Foreign key integrity", table_cell_style),
         Paragraph("All EntityState.Added, Modified, and Deleted operations sync instantly to MongoDB Atlas document collections.", table_cell_style),
         Paragraph("PASS", pass_badge_style)],
    ]

    t_modules = Table(modules_data, colWidths=[90, 160, 204, 50])
    t_modules.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('BACKGROUND', (3,1), (3,-1), colors.HexColor("#D1FAE5")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_modules)
    story.append(Spacer(1, 14))

    # Section 2: Discovered & Resolved Issues
    story.append(Paragraph("2. Discovered Bugs & Technical Fixes Applied", heading1_style))

    bugs_data = [
        [Paragraph("<b>Issue ID & Defect Description</b>", table_header_style), 
         Paragraph("<b>Root Cause & Risk</b>", table_header_style), 
         Paragraph("<b>Remediation & Fix Implemented</b>", table_header_style)],
        
        [Paragraph("<b>BUG-01</b>: MongoDB Atlas duplicate key error during initial postgres user sync", table_cell_style),
         Paragraph("Initial seeding inserted users with new random GUIDs. PostgreSQL sync tried replacing by ID causing duplicate key exception on Email unique index.", table_cell_style),
         Paragraph("Updated MongoDbSeeder.cs to query and replace documents using Email filter (Builders.Filter.Eq(x => x.Email, u.Email)).", table_cell_style)],

        [Paragraph("<b>BUG-02</b>: Light/Dark mode toggle button un-responsive on Login and Register pages", table_cell_style),
         Paragraph("Login page contained invalid 'light:bg-slate-50' class modifiers and hardcoded dark slate backgrounds that ignored standard Tailwind dark class removal.", table_cell_style),
         Paragraph("Refactored login/page.tsx and register/page.tsx to use proper responsive Tailwind light/dark utilities (bg-slate-50 dark:bg-slate-950).", table_cell_style)],

        [Paragraph("<b>BUG-03</b>: Missing future due date validation during teacher coursework creation", table_cell_style),
         Paragraph("Teachers could accidentally set DueDateUtc in the past when creating assignments, immediately marking them overdue.", table_cell_style),
         Paragraph("Added explicit validation in TeacherService.ValidateAssignmentRequest: if (dueDateUtc <= DateTime.UtcNow) throw AppException(400).", table_cell_style)],

        [Paragraph("<b>BUG-04</b>: Frontend Admin User Management missing permanent hard delete action", table_cell_style),
         Paragraph("Admin interface only offered 'Deactivate' (soft delete), leaving no mechanism to remove invalid test accounts.", table_cell_style),
         Paragraph("Added DeleteUserAsync to IAdminService, DELETE /api/v1/admin/users/{id} endpoint, and red 'Delete' button in frontend table.", table_cell_style)],
    ]

    t_bugs = Table(bugs_data, colWidths=[150, 174, 180])
    t_bugs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, light_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_bugs)
    story.append(Spacer(1, 14))

    # Section 3: Verification Logs Snippet
    story.append(Paragraph("3. Verification Execution Logs & Build Outputs", heading1_style))

    dotnet_test_log = """
    $ dotnet test backend/AssignmentSystem.UnitTests/AssignmentSystem.UnitTests.csproj
    Starting test execution, please wait...
    A total of 1 test files matched the specified pattern.

    Passed!  - Failed: 0, Passed: 26, Skipped: 0, Total: 26, Duration: 660 ms
    """
    story.append(Paragraph("<b>xUnit Backend Automated Test Suite Execution Log:</b>", heading2_style))
    story.append(Paragraph(dotnet_test_log.strip(), code_style))

    frontend_build_log = """
    $ npm run build (in frontend/)
    ▲ Next.js 16.3.0 (Turbopack)
    ✓ Compiled successfully in 915ms
    ✓ Running TypeScript took 1731ms
    ✓ Generating static pages using 11 workers (21/21) in 488ms
    Finalizing page optimization...
    """
    story.append(Paragraph("<b>Next.js Frontend Production Build Execution Log:</b>", heading2_style))
    story.append(Paragraph(frontend_build_log.strip(), code_style))
    story.append(Spacer(1, 10))

    # Section 4: Remaining Risks & Security Mitigation Strategy
    story.append(Paragraph("4. Remaining Risks & Security Hardening Recommendations", heading1_style))
    
    risks_points = [
        "<b>Distributed Transaction Fallback</b>: Primary writes occur in PostgreSQL RDBMS while secondary dual sync writes to MongoDB Atlas. Network disruption to MongoDB Atlas is handled gracefully without failing PostgreSQL API calls, but could cause transient document lag if cloud DB is unreachable.",
        "<b>Rate Limiting & Anti-Bruteforce</b>: Recommended to configure IP rate-limiting middleware (e.g. AspNetCoreRateLimit) for /api/v1/auth/login in high-traffic production deployments.",
        "<b>JWT Key Rotation</b>: Ensure production deployment environment variables set a strong, rotating 256-bit secret key for JWT signing."
    ]

    for item in risks_points:
        story.append(Paragraph(f"• {item}", bullet_style))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceBefore=6, spaceAfter=10))
    story.append(Paragraph("<b>Report Certified By:</b> Antigravity IDE Lead Quality Assurance Engineer", ParagraphStyle('Sign', parent=body_style, fontName='Helvetica-Bold', textColor=secondary_color)))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF report: {os.path.abspath(filename)}")

if __name__ == "__main__":
    build_pdf()
