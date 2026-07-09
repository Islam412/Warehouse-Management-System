// أضف هذا داخل المكون
import { useUnreadCount } from '@/hooks/useNotifications';

// داخل المكون
const { data: unreadCount } = useUnreadCount();

// في عنصر الإشعارات
<Link href="/notifications" ...>
  <Bell className="h-5 w-5" />
  {!isCollapsed && 'الإشعارات'}
  {unreadCount > 0 && (
    <span className="mr-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
      {unreadCount}
    </span>
  )}
</Link>
