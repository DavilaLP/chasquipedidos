package com.appdelivery.app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        FieldError firstError = ex.getBindingResult().getFieldError();
        if (firstError != null) {
            errors.put("error", "Validación fallida");
            errors.put("campo", firstError.getField());
            errors.put("mensaje", firstError.getDefaultMessage());
        } else {
            errors.put("error", "Validación fallida");
            errors.put("mensaje", "Datos inválidos");
        }
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
