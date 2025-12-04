// 백그라운드에서 카운트 증가를 담당하는 코드
// 화면이 따로 존재하지 않고, 보이지 않는 곳에서 작동

package com.example.lab8_20214677

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import kotlinx.coroutines.*

class CountService : Service() {

    private var isCounting = true
    private var job: Job? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {

        isCounting = true

        job = CoroutineScope(Dispatchers.Default).launch {
            var count = 0
            while (isCounting) {
                delay(1000)
                count++
                Log.d("CountService", "Current Count: $count")
            }
        }

        return START_STICKY
    }

    // 만약에 onDestroy가 불러지면, counting하고 있는 역할을 중단함
    override fun onDestroy() {
        super.onDestroy()
        isCounting = false
        job?.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
