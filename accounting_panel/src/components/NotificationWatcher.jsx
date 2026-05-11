import { useEffect, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import apiClient from '../api/apiClient';

const POLLING_INTERVAL = process.env.NODE_ENV === 'development' ? 15000 : 300000; // Dev: 15s, Prod: 5m

const NotificationWatcher = ({ user }) => {
  const { addToast } = useToast();
  const knownInvoiceIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Ses çalma fonksiyonu (Glassy "di-ri-ri-ri" su damlası / kabarcık efekti)
  const playChime = () => {
    try {
      const isMuted = localStorage.getItem('in_app_notifications_sound_muted') === 'true';
      if (isMuted) return;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(err => console.log('Audio resume error:', err));
      }
      
      // Mi5 (659.25), La5 (880.00), Do#6 (1109.73), Mi6 (1318.51) - Parlak A Major Arpeji
      const notes = [659.25, 880.00, 1109.73, 1318.51];
      const startTime = audioCtx.currentTime;

      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // 'sine' dalgası su damlası / pürüzsüz cam tınısı üretir
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime + index * 0.045);
        
        // Çok hızlı yükseliş ve sönümleme ile damla/balon patlama hissi (di-ri-ri-ri)
        gainNode.gain.setValueAtTime(0, startTime + index * 0.045);
        gainNode.gain.linearRampToValueAtTime(0.035, startTime + index * 0.045 + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + index * 0.045 + 0.22);
        
        osc.start(startTime + index * 0.045);
        osc.stop(startTime + index * 0.045 + 0.28);
      });
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  };

  const userId = user?.id;
  const userName = user?.name;
  const userRole = user?.role;
  const userDepartment = user?.department;

  useEffect(() => {
    // Kullanıcı giriş yapmamışsa veya aktif token yoksa çalışmasın
    const token = localStorage.getItem('token');
    if (!userName || !token) {
      knownInvoiceIdsRef.current.clear();
      isFirstLoadRef.current = true;
      return;
    }

    const checkNewInvoices = async () => {
      try {
        const response = await apiClient.get('/invoice');
        const invoices = response.data || [];
        
        console.log('[NW] Kontrol çalıştı. Toplam fatura:', invoices.length, '| Bilinen:', knownInvoiceIdsRef.current.size, '| İlk yükleme:', isFirstLoadRef.current);
        
        // Mevcut gelen fatura ID'lerini topla
        const currentIds = invoices.map(inv => inv._id);
        
        if (isFirstLoadRef.current) {
          // İlk yüklemede mevcut tüm faturaları "bilinen" olarak işaretle (eski faturalar için tekrar uyarı vermesin)
          knownInvoiceIdsRef.current = new Set(currentIds);
          isFirstLoadRef.current = false;
          
          console.log('[NW] İlk yükleme tamamlandı. Bilinen fatura sayısı:', currentIds.length);
          
          // Yerel hafızaya da yedekleyelim
          localStorage.setItem('known_invoice_ids', JSON.stringify(currentIds));
          return;
        }

        // Yeni eklenen faturaları bul ve çift yönlü akıllı kurallara göre filtrele
        const newInvoices = invoices.filter(inv => {
          const isNew = !knownInvoiceIdsRef.current.has(inv._id);
          if (!isNew) return false;

          const uploader = inv.uploadedBy || {};
          const uploaderId = String(uploader._id || uploader);

          // 1. Faturayı yükleyen kişi kendisi ise kesinlikle bildirim almasın (Kendi bildirim engeli)
          if (uploaderId === String(userId)) return false;

          console.log('[NW] Yeni fatura bulundu! ID:', inv._id, '| Uploader:', inv.uploadedBy?.fullname, '| Dept:', inv.department);

          // Çalışan sadece kendi departmanına atanan faturaların bildirimini alsın
          if (userRole === 'USER') {
            const result = inv.department === userDepartment;
            console.log('[NW] USER filtre - uploaderId:', uploaderId, '| userId:', String(userId), '| dept eşleşme:', inv.department === userDepartment, '| Geçti mi:', result);
            return result;
          }

          // Yönetici ve Adminler şirketteki her yeni faturanın bildirimini alsın
          return true;
        });

        if (newInvoices.length > 0) {
          const currentNotifications = JSON.parse(localStorage.getItem('in_app_notifications') || '[]');

          // Yeni faturaları uyar
          newInvoices.forEach(inv => {
            const vendor = inv.vendor || 'Genel';
            const amount = apiClient.formatCurrency(inv.amount);
            const uploaderName = inv.uploadedBy?.fullname || 'Bir çalışan';
            const uploaderRole = inv.uploadedBy?.role || 'USER';
            const department = inv.department || 'Diger';
            
            const uploader = inv.uploadedBy || {};
            const uploaderId = String(uploader._id || uploader);
            const isSelf = uploaderId === String(userId);

            let title = '';
            let message = '';

            if (isSelf) {
              title = 'Faturanız Yüklendi! 📄';
              message = `${department} departmanı adına ${vendor} firmasından ${amount} tutarındaki faturanız başarıyla sisteme yüklendi.`;
              addToast(`📄 Faturanız Yüklendi: ${vendor} firmasından ${amount} tutarındaki faturanız başarıyla kaydedildi.`, 'success', 7000);
            } else if (uploaderRole === 'MANAGER' || uploaderRole === 'ADMIN') {
              title = 'Yeni Fatura Atandı! 🔔';
              message = `Yöneticiniz ${uploaderName}, ${department} departmanı için ${vendor} firmasından ${amount} tutarında yeni bir faturayı ekledi!`;
              addToast(`🔔 Yeni Fatura Atandı: Yöneticiniz ${uploaderName}, ${department} departmanı için ${vendor} firmasından ${amount} tutarında yeni bir fatura ekledi!`, 'info', 7000);
            } else {
              title = 'Yeni Fatura Yüklendi! 📄';
              message = `${uploaderName}, ${department} departmanı adına ${vendor} firmasından ${amount} tutarında yeni bir fatura ekledi.`;
              addToast(`📄 Yeni Fatura Yüklendi: ${uploaderName}, ${department} departmanı adına ${vendor} firmasından ${amount} tutarında yeni bir fatura ekledi.`, 'info', 7000);
            }

            // Listeye ekle (başa ekle ki en son bildirim en üstte olsun)
            currentNotifications.unshift({
              id: inv._id,
              title,
              message,
              createdAt: new Date().toISOString(),
              read: false
            });
          });

          // Maksimum 50 bildirim saklayalım
          const trimmedNotifications = currentNotifications.slice(0, 50);
          localStorage.setItem('in_app_notifications', JSON.stringify(trimmedNotifications));
          
          // Diğer bileşenlere (Topbar gibi) haber ver
          window.dispatchEvent(new CustomEvent('newNotification'));
          
          // Chime sesini çal
          playChime();

          // Bilinenler listesini güncelle
          currentIds.forEach(id => knownInvoiceIdsRef.current.add(id));
          localStorage.setItem('known_invoice_ids', JSON.stringify(Array.from(knownInvoiceIdsRef.current)));
        }
      } catch (err) {
        console.error('Notification Watcher Error:', err);
      }
    };

    // İlk denemeyi hemen yap
    checkNewInvoices();

    // Zamanlayıcıyı kur
    const timer = setInterval(checkNewInvoices, POLLING_INTERVAL);

    return () => clearInterval(timer);
  }, [userId, userName, userRole, userDepartment, addToast]);

  return null; // Görsel arayüzü yoktur, arka planda görünmez bir koruyucudur
};

export default NotificationWatcher;
