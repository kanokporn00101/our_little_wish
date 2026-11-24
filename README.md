# Our Little Wish — กระทงน้อยของเรา (GitHub Pages + Firebase)

เวอร์ชันนี้ใช้ GitHub Pages โฮสต์หน้าเว็บ และ Firebase Realtime Database ซิงก์กระทงระหว่างคนสองคนได้
การซิงก์ใช้ polling ทุกประมาณ 3 วินาที (ไม่ใช่ websocket realtime แท้ แต่เกือบสด)

## 1) ตั้ง Firebase
1. ไปที่ https://console.firebase.google.com/ และสร้าง Project
2. ในเมนู Build เลือก Realtime Database > Create Database
3. เลือกตำแหน่ง Database (เลือกใกล้ผู้ใช้ได้ถ้ามี)
4. สร้าง Database ในโหมด locked ก่อนก็ได้ จากนั้นไปแท็บ Rules แล้วใส่กฎด้านล่างเพื่อทดลองเว็บคู่รัก
5. กด Publish

กฎที่แนะนำ (อ่านได้ เขียนกระทงใหม่ได้ แต่แก้ทับหรือลบของเดิมไม่ได้ และจำกัดความยาวข้อความ):
```json
{
  "rules": {
    "rooms": {
      "$room": {
        "krathongs": {
          ".read": true,
          "$id": {
            ".write": "!data.exists()",
            ".validate": "newData.hasChildren(['id','name','style','wish','at']) && newData.child('wish').isString() && newData.child('wish').val().length <= 200 && newData.child('name').isString() && newData.child('name').val().length <= 16 && (!newData.hasChild('tag') || newData.child('tag').val().length <= 12)"
          }
        }
      }
    }
  }
}
```
**หมายเหตุ:** รหัสห้องไม่ใช่ระบบรักษาความปลอดภัยจริง ใครรู้ URL ฐานข้อมูลและรหัสห้องก็อ่านคำอธิษฐานในห้องนั้นได้ ใช้เฉพาะกิจกรรมส่วนตัว ไม่ใส่ข้อมูลลับ

## 2) เชื่อม Database URL เข้ากับเว็บ
1. คัดลอก URL ที่หน้า Realtime Database (เช่น `https://your-project-default-rtdb.firebaseio.com`)
2. เปิด `firebase-config.js`
3. วาง URL ในบรรทัดนี้ โดยไม่ต้องเติม `/` ท้าย:
   `window.FIREBASE_DATABASE_URL = 'https://...';`
4. Save

## 3) ทดสอบก่อนอัปโหลด
เปิดไฟล์ `index.html` ด้วย Live Server ใน VS Code (แนะนำ) หรือโฮสต์เว็บบน localhost
- เปิดเว็บสองหน้าต่าง/สองอุปกรณ์
- ใส่ชื่อคนละชื่อ แต่ใส่ Room code เดียวกัน
- เลือกกระทงและเขียนคำอธิษฐาน
- ปล่อยกระทง; อีกหน้าจะเห็นภายในประมาณ 3 วินาที

## 4) Deploy GitHub Pages
1. สร้าง GitHub Repository ใหม่ (แนะนำ Public สำหรับ GitHub Pages ฟรี)
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์ `our_little_wish` ไปไว้ที่ root repository:
   - index.html
   - style.css
   - script.js
   - firebase-config.js
   - README.md (ไม่จำเป็นต่อเว็บ)
   - music.mp3 (ถ้ามีเพลง)
3. GitHub: Repository > Settings > Pages
4. Build and deployment เลือก `Deploy from a branch`
5. Branch เลือก `main`, Folder เลือก `/ (root)` แล้ว Save
6. รอ GitHub Pages สร้างเว็บ แล้วใช้ URL ที่แสดง (เช่น `https://username.github.io/repo/`)

## 5) เชิญแฟน
- เข้าเว็บ ใส่ชื่อและรหัสห้องเดียวกันทั้งสองคน
- หลังเข้าห้อง กด “复制邀请链接 / คัดลอกลิงก์ชวน” ส่งให้อีกคน
- หากเปิดลิงก์แล้วมี room query ให้ชื่อห้องเติมให้อัตโนมัติ
- เว็บจำชื่อ/รหัสห้องของผู้ใช้ไว้ในเบราว์เซอร์

## แก้ไขเว็บ
- ข้อความและหน้าตา: `index.html`, `style.css`
- การทำงาน/ซิงก์: `script.js`
- Database URL: `firebase-config.js`
- เพลง: วาง `music.mp3` ข้างไฟล์ HTML

## หมายเหตุ
- ระบบในเวอร์ชันนี้จะเก็บกระทงใน Firebase ต่อไปจนกว่าจะลบข้อมูลเองจาก Console
- หาก Firebase Rules ยังล็อกอยู่ จะใช้โหมด local และแสดงข้อความเตือน
- Node server/data.json ที่แนบมาเดิมไม่จำเป็นสำหรับ GitHub Pages แล้ว (สามารถเก็บไว้เป็นสำรองได้ แต่ไม่ต้องอัปโหลด)

## หน้าตาและกระทง (เวอร์ชันนี้)
- กระทงวาดด้วย SVG ล้วน (ไม่มีรูปภาพ/อีโมจิ): กลีบบัวซ้อนหลายชั้น กุหลาบแดง ดอกมะลิ ท่อนกล้วย ธูปสามก้าน เทียนที่เปลวไหวได้ และป้ายคำอธิษฐานเล็ก ๆ ปักข้างกระทง
- มี 3 แบบ: บัวชมพู (粉莲), บัวขาว (白莲), กระทงใบตอง (蕉叶灯)
- ช่อง "小签 / ป้ายคำอวยพร" (ไม่เกิน 12 ตัว) แสดงบนป้ายของกระทง ส่วนคำอธิษฐานเต็มกดอ่านได้ในหน้าต่างกระดาษ
- ฉากแม่น้ำ: วัดไทยยามค่ำ เจดีย์ทอง พระอุโบสถ แสงไฟริมฝั่งผสมโคมแดงแบบจีน เงาสะท้อนบนผิวน้ำ กลีบดอกไม้ลอย
- กระทงของเราจะอยู่แถวหน้าสุดและเรืองแสงทอง ของอีกคนลอยอยู่แถวหลังตามลำดับ
- ไฟล์ server.js / package.json ใช้เฉพาะตอนรันบนเครื่องตัวเอง ไม่ต้องอัปโหลดขึ้น GitHub Pages

## โหมดเต็มจอ
หน้าลอยกระทงเป็นเต็มจอ: แถบด้านบนมีรหัสห้อง สถานะ ปุ่มคัดลอกลิงก์ชวน และปุ่มจุดพลุ แตะกระทงใบไหนก็ได้เพื่ออ่านคำอธิษฐาน (ของตัวเองและของอีกคน)
