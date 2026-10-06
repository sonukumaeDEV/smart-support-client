
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import api from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const dropdownRef = useRef(null);

  // ==========================================
  // LOAD UNREAD COUNT
  // ==========================================

  const loadUnreadCount = async () => {
    try {
      const response = await api.get(
        "/Notification/unread-count"
      );

      setUnreadCount(
        response.data?.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Unread notification error:",
        error
      );
    }
  };

  // ==========================================
  // LOAD NOTIFICATIONS
  // ==========================================

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/Notification"
      );

      setNotifications(response.data || []);
    } catch (error) {
      console.error(
        "Notification loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadUnreadCount();

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // CLOSE DROPDOWN WHEN CLICK OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==========================================
  // TOGGLE DROPDOWN
  // ==========================================

  const handleToggle = async () => {
    const nextState = !isOpen;

    setIsOpen(nextState);

    if (nextState) {
      await loadNotifications();
    }
  };

  // ==========================================
  // MARK ONE AS READ
  // ==========================================

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(
        `/Notification/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0)
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);

      await api.put(
        "/Notification/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >

      {/* ======================================
          BELL BUTTON
      ====================================== */}

      <button
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
        aria-label="Notifications"
      >

        <Bell size={20} />

        {/* UNREAD BADGE */}

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-950">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}

      </button>

      {/* ======================================
          DROPDOWN
      ====================================== */}

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-[360px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">

            <div>
              <h3 className="font-semibold text-white">
                Notifications
              </h3>

              <p className="text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-1.5 text-xs text-cyan-400 transition hover:text-cyan-300 disabled:opacity-50"
              >

                {markingAll ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCheck size={14} />
                )}

                Mark all read

              </button>
            )}

          </div>

          {/* NOTIFICATION LIST */}

          <div className="max-h-[400px] overflow-y-auto">

            {loading ? (

              <div className="flex items-center justify-center py-10">

                <Loader2
                  size={25}
                  className="animate-spin text-cyan-400"
                />

              </div>

            ) : notifications.length === 0 ? (

              <div className="px-6 py-10 text-center">

                <Bell
                  size={32}
                  className="mx-auto text-slate-700"
                />

                <p className="mt-3 text-sm text-slate-400">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  You're all caught up.
                </p>

              </div>

            ) : (

              notifications.map((notification) => {

                const notificationId =
                  notification.id ??
                  notification.Id;

                const message =
                  notification.message ??
                  notification.Message;

                const isRead =
                  notification.isRead ??
                  notification.IsRead;

                const createdAt =
                  notification.createdAt ??
                  notification.CreatedAt;

                return (
                  <div
                    key={notificationId}
                    onClick={() => {
                      if (!isRead) {
                        handleMarkAsRead(
                          notificationId
                        );
                      }
                    }}
                    className={`cursor-pointer border-b border-slate-800 px-4 py-4 transition hover:bg-slate-800/70 ${
                      !isRead
                        ? "bg-cyan-500/5"
                        : ""
                    }`}
                  >

                    <div className="flex gap-3">

                      {/* ICON */}

                      <div
                        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          !isRead
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        <Bell size={16} />
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <p
                            className={`text-sm leading-5 ${
                              !isRead
                                ? "font-medium text-slate-200"
                                : "text-slate-400"
                            }`}
                          >
                            {message}
                          </p>

                          {!isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                          )}

                        </div>

                        <p className="mt-2 text-[11px] text-slate-600">
                          {createdAt
                            ? new Date(
                                createdAt
                              ).toLocaleString()
                            : ""}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })

            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;

