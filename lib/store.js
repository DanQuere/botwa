import { jidNormalizedUser } from '@whiskeysockets/baileys';

export class MemoryStore {
  constructor() {
    this.messages = new Map();
    this.contacts = new Map();
    this.chats = new Map();
    this.groupMetadata = new Map();
    this.presence = new Map();
    this.lidMap = new Map(); // Pemetaan dua arah LID <-> Phone Number JID
    this.myJid = null;
    this.myLid = null;
    this.myNumber = null;

    // Pemetaan awal LID owner ke nomor telepon 628
    this.lidMap.set('26809672417297@lid', '6283896757956@s.whatsapp.net');
    this.lidMap.set('26809672417297@s.whatsapp.net', '6283896757956@s.whatsapp.net');
    this.lidMap.set('26809672417297', '6283896757956');
    this.lidMap.set('6283896757956@s.whatsapp.net', '26809672417297@lid');
    this.lidMap.set('6283896757956', '26809672417297');
  }

  bind(ev) {
    ev.on('contacts.set', ({ contacts }) => {
      for (const contact of contacts) {
        if (!contact) continue;
        const cId = contact.id ? jidNormalizedUser(contact.id) : null;
        const cLid = contact.lid ? jidNormalizedUser(contact.lid) : null;
        const cPn = contact.phoneNumber ? `${contact.phoneNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net` : null;

        if (cId) this.contacts.set(cId, contact);
        if (cLid) this.contacts.set(cLid, contact);

        if (cLid && cId && cId.endsWith('@s.whatsapp.net')) {
          this.lidMap.set(cLid, cId);
          this.lidMap.set(cId, cLid);
        }
        if (cLid && cPn) {
          this.lidMap.set(cLid, cPn);
          this.lidMap.set(cPn, cLid);
        }
      }
    });

    ev.on('contacts.upsert', (contacts) => {
      for (const contact of contacts) {
        if (!contact) continue;
        const cId = contact.id ? jidNormalizedUser(contact.id) : null;
        const cLid = contact.lid ? jidNormalizedUser(contact.lid) : null;
        const cPn = contact.phoneNumber ? `${contact.phoneNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net` : null;

        if (cId) {
          this.contacts.set(cId, { ...this.contacts.get(cId), ...contact });
        }
        if (cLid) {
          this.contacts.set(cLid, { ...this.contacts.get(cLid), ...contact });
        }

        if (cLid && cId && cId.endsWith('@s.whatsapp.net')) {
          this.lidMap.set(cLid, cId);
          this.lidMap.set(cId, cLid);
        }
        if (cLid && cPn) {
          this.lidMap.set(cLid, cPn);
          this.lidMap.set(cPn, cLid);
        }
      }
    });

    ev.on('groups.update', async (updates) => {
      for (const update of updates) {
        if (this.groupMetadata.has(update.id)) {
          const current = this.groupMetadata.get(update.id);
          this.groupMetadata.set(update.id, { ...current, ...update });
        }
      }
    });

    ev.on('group-participants.update', async ({ id, participants, action }) => {
      const meta = this.groupMetadata.get(id);
      if (!meta) return;

      if (action === 'add') {
        const newParticipants = participants.map(p => ({
          id: p,
          admin: null
        }));
        meta.participants.push(...newParticipants);
      } else if (action === 'remove') {
        meta.participants = meta.participants.filter(p => !participants.includes(p.id));
      } else if (action === 'promote') {
        if (meta.participants) {
          for (const p of meta.participants) {
            if (participants.includes(p.id)) p.admin = 'admin';
          }
        }
      } else if (action === 'demote') {
        if (meta.participants) {
          for (const p of meta.participants) {
            if (participants.includes(p.id)) p.admin = null;
          }
        }
      }
      this.groupMetadata.set(id, meta);
    });
  }

  /**
   * Mendapatkan nama kontak dari JID
   */
  getName(jid) {
    if (!jid) return '';
    const cleanJid = jidNormalizedUser(jid);
    const contact = this.contacts.get(cleanJid);
    return contact?.name || contact?.notify || contact?.verifiedName || contact?.pushName || '';
  }

  /**
   * Mengubah Linked Identity (LID) menjadi Phone Number JID (628xxx@s.whatsapp.net)
   */
  resolveLidToPn(rawLid, groupJid = null, sock = null) {
    if (!rawLid) return '';
    const rawNumber = String(rawLid).split('@')[0].replace(/[^0-9]/g, '');
    const cleanLid = typeof rawLid === 'string' && rawLid.includes('@') ? jidNormalizedUser(rawLid) : `${rawNumber}@lid`;

    // Cek cache map langsung (JID lengkap atau nomor mentah)
    if (this.lidMap.has(cleanLid)) {
      return this.lidMap.get(cleanLid);
    }
    if (rawNumber && this.lidMap.has(rawNumber)) {
      const mapped = this.lidMap.get(rawNumber);
      return mapped.endsWith('@s.whatsapp.net') ? mapped : `${mapped}@s.whatsapp.net`;
    }
    if (rawNumber && this.lidMap.has(`${rawNumber}@lid`)) {
      return this.lidMap.get(`${rawNumber}@lid`);
    }
    if (rawNumber && this.lidMap.has(`${rawNumber}@s.whatsapp.net`)) {
      return this.lidMap.get(`${rawNumber}@s.whatsapp.net`);
    }

    // Jika ini adalah LID owner 26809672417297
    if (rawNumber === '26809672417297') {
      return '6283896757956@s.whatsapp.net';
    }

    // Jika sudah format nomor internasional (@s.whatsapp.net) dan bukan format LID 14-16 digit
    if (cleanLid.endsWith('@s.whatsapp.net') && rawNumber.length <= 13) {
      return cleanLid;
    }

    // 1. Cek apakah ini adalah nomor bot/pairing sendiri
    if (this.myLid && cleanLid === this.myLid && this.myJid) {
      return this.myJid;
    }
    if (sock?.user) {
      const myId = jidNormalizedUser(sock.user.id || '');
      const myLid = sock.user.lid ? jidNormalizedUser(sock.user.lid) : null;
      if (myLid && cleanLid === myLid && myId) {
        this.lidMap.set(cleanLid, myId);
        return myId;
      }
    }

    // 3. Cek di daftar Kontak
    for (const [cId, contact] of this.contacts.entries()) {
      if (contact.lid && jidNormalizedUser(contact.lid) === cleanLid) {
        const pn = jidNormalizedUser(contact.id || contact.jid || cId);
        if (pn.endsWith('@s.whatsapp.net')) {
          this.lidMap.set(cleanLid, pn);
          this.lidMap.set(pn, cleanLid);
          return pn;
        }
      }
      if (cId === cleanLid && (contact.phoneNumber || contact.jid || contact.id)) {
        const rawPn = contact.phoneNumber || contact.jid || contact.id;
        const cleanNum = rawPn.replace(/[^0-9]/g, '');
        if (cleanNum.length >= 8) {
          const pn = `${cleanNum}@s.whatsapp.net`;
          this.lidMap.set(cleanLid, pn);
          this.lidMap.set(pn, cleanLid);
          return pn;
        }
      }
    }

    // 4. Cek di metadata grup yang tersimpan
    if (groupJid && this.groupMetadata.has(groupJid)) {
      const meta = this.groupMetadata.get(groupJid);
      if (meta?.participants) {
        const found = meta.participants.find(p => p.lid && jidNormalizedUser(p.lid) === cleanLid);
        if (found && found.id) {
          const pnJid = jidNormalizedUser(found.id);
          this.lidMap.set(cleanLid, pnJid);
          this.lidMap.set(pnJid, cleanLid);
          return pnJid;
        }
      }
    }

    // 5. Cari di seluruh cache grup yang pernah dimuat
    for (const meta of this.groupMetadata.values()) {
      if (meta?.participants) {
        const found = meta.participants.find(p => p.lid && jidNormalizedUser(p.lid) === cleanLid);
        if (found && found.id) {
          const pnJid = jidNormalizedUser(found.id);
          this.lidMap.set(cleanLid, pnJid);
          this.lidMap.set(pnJid, cleanLid);
          return pnJid;
        }
      }
    }

    return cleanLid;
  }

  resolvePnToLid(pn) {
    if (!pn) return pn;
    const cleanPn = jidNormalizedUser(pn);
    return this.lidMap.get(cleanPn) || cleanPn;
  }

  async fetchGroupMetadata(sock, jid, force = false) {
    if (!force && this.groupMetadata.has(jid)) {
      return this.groupMetadata.get(jid);
    }
    try {
      const meta = await sock.groupMetadata(jid);
      this.groupMetadata.set(jid, meta);
      // Simpan pemetaan LID <-> PNJID dari semua peserta grup
      if (meta.participants) {
        for (const p of meta.participants) {
          if (p.id && p.lid) {
            const pIdNorm = jidNormalizedUser(p.id);
            const pLidNorm = jidNormalizedUser(p.lid);
            this.lidMap.set(pLidNorm, pIdNorm);
            this.lidMap.set(pIdNorm, pLidNorm);
          }
        }
      }
      return meta;
    } catch (err) {
      return null;
    }
  }
}

export const store = new MemoryStore();
export default store;
