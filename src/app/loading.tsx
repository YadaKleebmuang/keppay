export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity">
      <div className="flex flex-col items-center gap-5 text-center p-6 max-w-sm">
        {/* Mascot Image ที่มี Bounce Animation */}
        <div className="relative size-24 animate-bounce">
          <img
            src="/Kep.png"
            alt="กำลังโหลด..."
            className="size-full object-contain"
          />
        </div>
        {/* วงล้อหมุนโหลด */}
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-foreground">กำลังโหลดข้อมูล...</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            กรุณารอสักครู่ ระบบกำลังจัดเตรียมข้อมูลให้คุณ
          </p>
        </div>
      </div>
    </div>
  );
}
