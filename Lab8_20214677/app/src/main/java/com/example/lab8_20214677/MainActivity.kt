
// MainActivity에서는 버튼 UI 생성 + 서비스 실행 및 중지 + 연락처 권한 요청 + 연락처 읽기를 수행함
// 리팩토링하여 UI 호출 및 기능 전달만으로 변경

package com.example.lab8_20214677

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.ContactsContract
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.example.lab8_20214677.ui.HomeScreen
import com.example.lab8_20214677.ui.theme.Lab8_20214677Theme

class MainActivity : ComponentActivity() {

    private val contactPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) readOneContact()
            else Toast.makeText(this, "Permission denied", Toast.LENGTH_SHORT).show()
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            Lab8_20214677Theme {
                HomeScreen(
                    onStartService = {
                        startService(Intent(this, CountService::class.java))
                    },
                    onStopService = {
                        stopService(Intent(this, CountService::class.java))
                    },
                    onReadContact = {
                        checkContactPermission()
                    }
                )
            }
        }
    }

    private fun checkContactPermission() {
        val permission = Manifest.permission.READ_CONTACTS

        when {
            ContextCompat.checkSelfPermission(this, permission)
                    == PackageManager.PERMISSION_GRANTED -> {
                readOneContact()
            }

            else -> {
                contactPermissionLauncher.launch(permission)
            }
        }
    }

    private fun readOneContact() {
        val cursor = contentResolver.query(
            ContactsContract.Contacts.CONTENT_URI,
            null, null, null, null
        )

        cursor?.let {
            if (it.moveToFirst()) {
                val name = it.getString(
                    it.getColumnIndexOrThrow(ContactsContract.Contacts.DISPLAY_NAME)
                )
                Toast.makeText(this, "Contact: $name", Toast.LENGTH_LONG).show()
            }
            it.close()
        }
    }
}
