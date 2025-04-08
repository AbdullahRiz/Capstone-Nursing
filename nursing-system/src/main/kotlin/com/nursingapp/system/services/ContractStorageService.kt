package com.nursingapp.system.services

import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

@Service
class ContractStorageService {
    private val uploadDirectory = Paths.get("./contracts")

    fun uploadContract(contractFile: MultipartFile): String {
        Files.createDirectories(uploadDirectory)
        val filePath = contractFile.originalFilename?.let { uploadDirectory.resolve(it) }
        if (filePath != null) {
            Files.copy(contractFile.inputStream, filePath, StandardCopyOption.REPLACE_EXISTING)
        }
        return contractFile.originalFilename!!
    }

    fun getContractFile(filename: String): ByteArray {
        val filePath = uploadDirectory.resolve(filename)
        return Files.readAllBytes(filePath)
    }
}