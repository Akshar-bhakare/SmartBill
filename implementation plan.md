# Implementation Plan: Warranty Letter Generator

## 1. Objective

Extend the existing SmartBill application so a user can:

1. Upload an invoice PDF
2. Extract invoice details
3. Upload an Excel file containing serial numbers
4. Validate that the serial count matches the invoice quantity
5. Generate a warranty letter PDF from a reusable HTML template
6. Preview and download the generated PDF

The implementation should be template-driven so the warranty format can be changed later by editing the HTML template rather than modifying application code.

---

## 2. Scope

### Frontend
- Add a new warranty-generation workflow in the client app
- Provide drag-and-drop upload areas for:
  - invoice PDF
  - Excel file
- Show extracted invoice values and upload status
- Show quantity validation result
- Allow preview and download of the generated warranty PDF

### Backend
- Add API endpoints for:
  - invoice parsing
  - Excel parsing
  - warranty PDF generation
- Implement parsing and generation services
- Store temporary uploaded files and generated PDFs

### Template System
- Create a single HTML template with placeholders such as:
  - {{customerName}}
  - {{invoiceNo}}
  - {{invoiceDate}}
  - {{address}}
  - {{gst}}
  - {{product}}
  - {{manufacturer}}
  - {{serialRows}}
- Render the annexure table dynamically based on the uploaded serial numbers

---

## 3. Proposed Architecture

### Client
- Add a new page or section for warranty generation
- Use existing UI patterns from the current app for cards, buttons, and status feedback
- Use React + TypeScript + Tailwind for the workflow UI

### Server
- Add a new route group such as:
  - /api/warranty/parse-invoice
  - /api/warranty/parse-serials
  - /api/warranty/generate
- Keep parsing and PDF generation logic in the service layer for separation of concerns

### Files / Modules

```text
client/src/
  pages/
    WarrantyGeneratorPage.tsx
  services/
    warranty.api.ts

server/src/
  controllers/
    warranty.controller.ts
  routes/
    warranty.routes.ts
  services/
    invoiceParser.ts
    excelParser.ts
    warrantyGenerator.ts
  utils/
    fileUtils.ts

templates/
  warranty.html

uploads/
generated/
```

---

## 4. Implementation Phases

### Phase 1: Project Setup
- Add required backend dependencies:
  - pdf-parse or pdfjs-dist
  - xlsx
  - puppeteer
  - multer
- Add frontend support for file upload and API calls
- Create folders for templates, uploads, and generated output

### Phase 2: Invoice PDF Parsing
- Implement invoice extraction from the uploaded PDF text
- Extract the following fields where possible:
  - customer name
  - customer address
  - GSTIN
  - invoice number
  - invoice date
  - warranty number
  - company name
  - product name
  - quantity
- Use regex-based extraction with tolerant handling for formatting variations
- Return a normalized object to the frontend

### Phase 3: Excel Serial Parsing
- Implement Excel parsing using SheetJS
- Read the first relevant sheet
- Extract serial numbers from rows that contain values
- Ignore empty rows and non-serial data
- Return a clean array of serial numbers

### Phase 4: Quantity Validation
- Compare the invoice quantity with the number of extracted serials
- If they match, allow generation
- If they differ, return a validation error such as:
  - Quantity mismatch.
  - Expected 216 serial numbers.
  - Found 213.

### Phase 5: Template-Based Warranty Generation
- Create one fixed HTML template with placeholders
- Replace placeholders with invoice and customer values
- Insert the serial-number annexure as a dynamic table
- Ensure the table can span multiple pages automatically
- Use a PDF engine such as Puppeteer to render the HTML into a PDF

### Phase 6: Frontend Workflow Integration
- Build a step-by-step UI flow:
  1. Upload invoice PDF
  2. Extract invoice details
  3. Upload Excel file
  4. Validate serial count
  5. Generate warranty PDF
  6. Preview/download the final PDF
- Display success and error states clearly

### Phase 7: Testing and Refinement
- Add unit tests for:
  - invoice parsing
  - Excel parsing
  - quantity validation
  - template replacement
- Add an end-to-end test for the full generate flow using sample documents
- Verify output formatting against the provided warranty sample

---

## 5. Detailed Task Breakdown

### Backend Tasks
- Create route definitions for warranty endpoints
- Create controller methods for parse and generate actions
- Implement service logic for invoice extraction
- Implement service logic for Excel serial extraction
- Implement PDF generation using HTML template rendering
- Save generated files to the generated folder and return a download URL

### Frontend Tasks
- Add file input components and drag-and-drop areas
- Create UI state for:
  - uploaded invoice
  - extracted invoice fields
  - uploaded Excel file
  - serial count
  - generation status
  - preview/download state
- Call backend endpoints and show responses clearly

### Template Tasks
- Create a reusable HTML template file
- Include placeholder variables for all dynamic fields
- Include the annexure table layout with serial-number rows
- Ensure proper page breaks for long lists

---

## 6. Data Flow

```text
User uploads invoice PDF
  -> backend parses invoice content
  -> invoice details are returned to the frontend

User uploads Excel file
  -> backend parses serial numbers
  -> serial count is validated against invoice quantity

If validation passes
  -> backend renders warranty HTML template
  -> Puppeteer converts it to PDF
  -> frontend displays preview/download
```

---

## 7. Validation Rules

### Required Validation
- Invoice PDF must be uploaded
- Excel file must be uploaded
- Quantity must match before PDF generation is allowed

### Optional Nice-to-Haves
- Show preview before download
- Auto-fill manufacturer from invoice data
- Auto-fill product name from invoice data
- Use a company logo in the header of the warranty letter

---

## 8. Acceptance Criteria

The change is complete when:

- An invoice PDF can be uploaded and parsed
- Customer, invoice, and product details are extracted and shown
- An Excel file can be uploaded and serial numbers are read
- Quantity mismatch is detected and shown clearly
- A warranty letter PDF is generated from the template
- The generated PDF includes the annexure table with all serial numbers
- The file can be downloaded successfully

---

## 9. Recommended Implementation Order

1. Backend parsing services
2. Template and PDF generation
3. Frontend upload workflow
4. Validation and error handling
5. Preview/download experience
6. Testing and polish

---

## 10. Notes for Interview Impact

This feature should be implemented in a maintainable way by using:
- a template-driven warranty format
- a clean service-based backend design
- reusable parsing modules
- a simple but polished frontend workflow

This approach will demonstrate stronger engineering judgment than hardcoding a single PDF layout.
