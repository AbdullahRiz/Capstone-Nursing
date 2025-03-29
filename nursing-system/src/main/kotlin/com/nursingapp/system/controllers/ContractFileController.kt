package com.nursingapp.system.controllers

import com.nursingapp.system.services.ContractStorageService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api")
class ContractFileController(private val contractStorageService: ContractStorageService) {

    @PostMapping("/uploadContract")
    fun uploadFile(@RequestParam("file") file: MultipartFile): String {
        return contractStorageService.uploadContract(file)
    }

    @GetMapping("/contracts/{filename}", produces = [MediaType.APPLICATION_OCTET_STREAM_VALUE])
    fun getFile(@PathVariable filename: String): ResponseEntity<ByteArray> {
        val fileBytes = contractStorageService.getContractFile(filename)
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=$filename")
            .body(fileBytes)
    }
}