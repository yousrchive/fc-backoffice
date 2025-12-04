package com.example.lab8_20214677.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun HomeScreen(
    onStartService: () -> Unit,
    onStopService: () -> Unit,
    onReadContact: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.Center
    ) {

        Button(
            onClick = onStartService,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("START SERVICE")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onStopService,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("STOP SERVICE")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = onReadContact,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("READ CONTACT")
        }
    }
}
