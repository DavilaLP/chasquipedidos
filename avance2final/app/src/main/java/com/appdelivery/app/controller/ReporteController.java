package com.appdelivery.app.controller;

import com.appdelivery.app.entity.Pedido;
import com.appdelivery.app.entity.Usuario;
import com.appdelivery.app.repository.PedidoRepository;
import com.appdelivery.app.entity.Producto;
import com.appdelivery.app.repository.ProductoRepository;
import com.appdelivery.app.repository.UsuarioRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;
import java.awt.Color;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin/reportes")
public class ReporteController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping("/pedidos/pdf")
    public void exportarPedidosPDF(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=reporte_pedidos.pdf");

        List<Pedido> pedidos = pedidoRepository.findAll();

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        // Fuentes
        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        fontTitle.setSize(18);
        fontTitle.setColor(new Color(0, 102, 204));

        Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        fontHeader.setSize(12);
        fontHeader.setColor(Color.WHITE);

        Font fontBody = FontFactory.getFont(FontFactory.HELVETICA);
        fontBody.setSize(10);

        // Fecha de generación
        String fechaActual = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        Paragraph dateParagraph = new Paragraph("Generado el: " + fechaActual, fontBody);
        dateParagraph.setAlignment(Paragraph.ALIGN_RIGHT);
        document.add(dateParagraph);

        // Título del documento
        Paragraph paragraph = new Paragraph("Reporte de Pedidos - ChasquiPedidos", fontTitle);
        paragraph.setAlignment(Paragraph.ALIGN_CENTER);
        paragraph.setSpacingAfter(20);
        document.add(paragraph);

        // Tabla
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[] {1f, 2.5f, 2f, 1.5f, 1.5f, 1.5f});

        // Cabeceras de la tabla
        String[] headers = {"ID", "Cliente", "Fecha", "Metodo Pago", "Estado", "Total"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, fontHeader));
            cell.setBackgroundColor(new Color(0, 102, 204));
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        BigDecimal granTotal = BigDecimal.ZERO;

        for (Pedido pedido : pedidos) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(pedido.getIdPedido()), fontBody)));
            table.addCell(new PdfPCell(new Phrase(pedido.getUsuario().getNombres() + " " + pedido.getUsuario().getApellidos(), fontBody)));
            table.addCell(new PdfPCell(new Phrase(pedido.getFechaPedido() != null ? pedido.getFechaPedido().format(formatter) : "", fontBody)));
            table.addCell(new PdfPCell(new Phrase(pedido.getMetodoPago(), fontBody)));
            table.addCell(new PdfPCell(new Phrase(pedido.getEstadoPedido(), fontBody)));
            
            BigDecimal total = pedido.getTotal() != null ? pedido.getTotal() : BigDecimal.ZERO;
            table.addCell(new PdfPCell(new Phrase("S/ " + total.toString(), fontBody)));
            granTotal = granTotal.add(total);
        }

        document.add(table);

        // Gran Total al final
        Paragraph totalParagraph = new Paragraph("Ingresos Totales: S/ " + granTotal.toString(), fontTitle);
        totalParagraph.setAlignment(Paragraph.ALIGN_RIGHT);
        totalParagraph.setSpacingBefore(15);
        document.add(totalParagraph);

        document.close();
    }

    @GetMapping("/pedidos/excel")
    public void exportarPedidosExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment; filename=reporte_pedidos.xlsx");

        List<Pedido> pedidos = pedidoRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Pedidos");

            // Estilos de cabecera
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] columns = {"ID Pedido", "Cliente", "Fecha", "Direccion Entrega", "Metodo Pago", "Estado Pedido", "Total (S/)"};

            // Fila para la fecha de generación
            Row dateRow = sheet.createRow(0);
            String fechaActual = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            Cell dateCell = dateRow.createCell(columns.length - 1);
            dateCell.setCellValue("Generado el: " + fechaActual);
            
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setAlignment(HorizontalAlignment.RIGHT);
            dateCell.setCellStyle(dateStyle);

            // Crear cabecera
            Row headerRow = sheet.createRow(1);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            int rowNum = 2;
            for (Pedido pedido : pedidos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(pedido.getIdPedido());
                row.createCell(1).setCellValue(pedido.getUsuario().getNombres() + " " + pedido.getUsuario().getApellidos());
                row.createCell(2).setCellValue(pedido.getFechaPedido() != null ? pedido.getFechaPedido().format(formatter) : "");
                row.createCell(3).setCellValue(pedido.getDireccionEntrega());
                row.createCell(4).setCellValue(pedido.getMetodoPago());
                row.createCell(5).setCellValue(pedido.getEstadoPedido());
                row.createCell(6).setCellValue(pedido.getTotal() != null ? pedido.getTotal().doubleValue() : 0.0);
            }

            // Auto-ajustar tamaño de columnas
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        }
    }

    @GetMapping("/usuarios/pdf")
    public void exportarUsuariosPDF(HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=reporte_usuarios.pdf");

        List<Usuario> usuarios = usuarioRepository.findAll();

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        fontTitle.setSize(18);
        fontTitle.setColor(new Color(40, 167, 69)); // Verde para usuarios

        Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        fontHeader.setSize(11);
        fontHeader.setColor(Color.WHITE);

        Font fontBody = FontFactory.getFont(FontFactory.HELVETICA);
        fontBody.setSize(9);

        String fechaActual = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        Paragraph dateParagraph = new Paragraph("Generado el: " + fechaActual, fontBody);
        dateParagraph.setAlignment(Paragraph.ALIGN_RIGHT);
        document.add(dateParagraph);

        Paragraph paragraph = new Paragraph("Reporte de Usuarios - ChasquiPedidos", fontTitle);
        paragraph.setAlignment(Paragraph.ALIGN_CENTER);
        paragraph.setSpacingAfter(20);
        document.add(paragraph);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[] {0.8f, 2f, 2.5f, 1.5f, 2.5f, 1f});

        String[] headers = {"ID", "Nombres", "Correo", "Telefono", "Direccion", "Rol"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, fontHeader));
            cell.setBackgroundColor(new Color(40, 167, 69));
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        for (Usuario usuario : usuarios) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(usuario.getIdUsuario()), fontBody)));
            table.addCell(new PdfPCell(new Phrase(usuario.getNombres() + " " + usuario.getApellidos(), fontBody)));
            table.addCell(new PdfPCell(new Phrase(usuario.getCorreo(), fontBody)));
            table.addCell(new PdfPCell(new Phrase(usuario.getTelefono() != null ? usuario.getTelefono() : "", fontBody)));
            table.addCell(new PdfPCell(new Phrase(usuario.getDireccion() != null ? usuario.getDireccion() : "", fontBody)));
            table.addCell(new PdfPCell(new Phrase(usuario.getRol() != null ? usuario.getRol() : "CLIENTE", fontBody)));
        }

        document.add(table);
        document.close();
    }

    @GetMapping("/productos/pdf")
    public void exportarProductosPDF(@RequestParam(required = false) String buscar, HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=reporte_productos.pdf");

        List<Producto> todosProductos = productoRepository.findAll();
        List<Producto> productosUnicos = new java.util.ArrayList<>();
        java.util.Set<String> nombresVistos = new java.util.HashSet<>();
        for (Producto p : todosProductos) {
            String nombre = p.getNombre() != null ? p.getNombre().trim().toLowerCase() : "";
            if (!nombresVistos.contains(nombre)) {
                nombresVistos.add(nombre);
                productosUnicos.add(p);
            }
        }
        List<Producto> productos = productosUnicos;

        if (buscar != null && !buscar.trim().isEmpty()) {
            String buscarLower = buscar.toLowerCase().trim();
            productos = productos.stream()
                .filter(p -> p.getNombre() != null && p.getNombre().toLowerCase().contains(buscarLower))
                .collect(Collectors.toList());
        }

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        fontTitle.setSize(18);
        fontTitle.setColor(new Color(255, 153, 0)); // Naranja para productos

        Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        fontHeader.setSize(11);
        fontHeader.setColor(Color.WHITE);

        Font fontBody = FontFactory.getFont(FontFactory.HELVETICA);
        fontBody.setSize(9);

        String fechaActual = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        Paragraph dateParagraph = new Paragraph("Generado el: " + fechaActual, fontBody);
        dateParagraph.setAlignment(Paragraph.ALIGN_RIGHT);
        document.add(dateParagraph);

        Paragraph paragraph = new Paragraph("Reporte de Productos - ChasquiPedidos", fontTitle);
        paragraph.setAlignment(Paragraph.ALIGN_CENTER);
        paragraph.setSpacingAfter(20);
        document.add(paragraph);

        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.setWidths(new float[] {1f, 3f, 1.5f, 1f, 2f, 2f});

        String[] headers = {"ID", "Nombre", "Precio", "Stock", "Categoría", "Restaurante"};
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, fontHeader));
            cell.setBackgroundColor(new Color(255, 153, 0));
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        for (Producto producto : productos) {
            table.addCell(new PdfPCell(new Phrase(String.valueOf(producto.getIdProducto()), fontBody)));
            table.addCell(new PdfPCell(new Phrase(producto.getNombre(), fontBody)));
            table.addCell(new PdfPCell(new Phrase(producto.getPrecio() != null ? "S/ " + producto.getPrecio().toString() : "S/ 0.0", fontBody)));
            table.addCell(new PdfPCell(new Phrase(producto.getStock() != null ? String.valueOf(producto.getStock()) : "0", fontBody)));
            table.addCell(new PdfPCell(new Phrase(producto.getCategoria() != null ? producto.getCategoria().getNombre() : "N/A", fontBody)));
            table.addCell(new PdfPCell(new Phrase(producto.getRestaurante() != null ? producto.getRestaurante().getNombre() : "N/A", fontBody)));
        }

        document.add(table);
        document.close();
    }

    @GetMapping("/productos/excel")
    public void exportarProductosExcel(@RequestParam(required = false) String buscar, HttpServletResponse response) throws IOException {
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment; filename=reporte_productos.xlsx");

        List<Producto> todosProductos = productoRepository.findAll();
        List<Producto> productosUnicos = new java.util.ArrayList<>();
        java.util.Set<String> nombresVistos = new java.util.HashSet<>();
        for (Producto p : todosProductos) {
            String nombre = p.getNombre() != null ? p.getNombre().trim().toLowerCase() : "";
            if (!nombresVistos.contains(nombre)) {
                nombresVistos.add(nombre);
                productosUnicos.add(p);
            }
        }
        List<Producto> productos = productosUnicos;

        if (buscar != null && !buscar.trim().isEmpty()) {
            String buscarLower = buscar.toLowerCase().trim();
            productos = productos.stream()
                .filter(p -> p.getNombre() != null && p.getNombre().toLowerCase().contains(buscarLower))
                .collect(Collectors.toList());
        }

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Productos");

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.ORANGE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] columns = {"ID", "Nombre", "Descripción", "Precio (S/)", "Stock", "Categoría", "Restaurante", "Estado"};

            // Fila para la fecha de generación
            Row dateRow = sheet.createRow(0);
            String fechaActual = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            Cell dateCell = dateRow.createCell(columns.length - 1);
            dateCell.setCellValue("Generado el: " + fechaActual);
            
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setAlignment(HorizontalAlignment.RIGHT);
            dateCell.setCellStyle(dateStyle);

            Row headerRow = sheet.createRow(1);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 2;
            for (Producto producto : productos) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(producto.getIdProducto());
                row.createCell(1).setCellValue(producto.getNombre());
                row.createCell(2).setCellValue(producto.getDescripcion() != null ? producto.getDescripcion() : "");
                row.createCell(3).setCellValue(producto.getPrecio() != null ? producto.getPrecio().doubleValue() : 0.0);
                row.createCell(4).setCellValue(producto.getStock() != null ? producto.getStock() : 0);
                row.createCell(5).setCellValue(producto.getCategoria() != null ? producto.getCategoria().getNombre() : "N/A");
                row.createCell(6).setCellValue(producto.getRestaurante() != null ? producto.getRestaurante().getNombre() : "N/A");
                row.createCell(7).setCellValue(producto.getDisponible() != null && producto.getDisponible() ? "Disponible" : "Agotado");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        }
    }

    @GetMapping("/usuarios/excel")
    public void exportarUsuariosExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment; filename=reporte_usuarios.xlsx");

        List<Usuario> usuarios = usuarioRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Usuarios");

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] columns = {"ID", "Nombres", "Apellidos", "Correo", "Telefono", "Direccion", "Rol", "Estado"};

            // Fila para la fecha de generación
            Row dateRow = sheet.createRow(0);
            String fechaActual = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            Cell dateCell = dateRow.createCell(columns.length - 1);
            dateCell.setCellValue("Generado el: " + fechaActual);
            
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setAlignment(HorizontalAlignment.RIGHT);
            dateCell.setCellStyle(dateStyle);

            Row headerRow = sheet.createRow(1);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 2;
            for (Usuario usuario : usuarios) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(usuario.getIdUsuario());
                row.createCell(1).setCellValue(usuario.getNombres());
                row.createCell(2).setCellValue(usuario.getApellidos());
                row.createCell(3).setCellValue(usuario.getCorreo());
                row.createCell(4).setCellValue(usuario.getTelefono());
                row.createCell(5).setCellValue(usuario.getDireccion());
                row.createCell(6).setCellValue(usuario.getRol() != null ? usuario.getRol() : "CLIENTE");
                row.createCell(7).setCellValue(usuario.getEstado() != null && usuario.getEstado() ? "Activo" : "Inactivo");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(response.getOutputStream());
        }
    }
}
