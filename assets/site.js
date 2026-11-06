// Démo consigne à bagages : choix de la langue et simulation de réservation (rien n’est enregistré ni envoyé)
(function () {
  const racine = document.documentElement

  // ---- Langue : les deux textes sont dans la page, on change <html lang>, le titre et la description
  function langue(l) {
    racine.lang = l
    try { localStorage.setItem("langue", l) } catch (e) {}
    document.querySelectorAll("[data-langue]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.langue === l)))
    document.title = window.TEXTES.titre[l]
    document.querySelector('meta[name="description"]').content = window.TEXTES.description[l]
    total()
  }
  document.querySelectorAll("[data-langue]").forEach((b) => b.addEventListener("click", () => langue(b.dataset.langue)))

  // ---- Réservation simulée
  const fenetre = document.getElementById("reservation")
  const etape = (n) => fenetre.querySelectorAll("[data-etape]").forEach((e) => (e.hidden = e.dataset.etape !== String(n)))
  const choisi = (nom) => fenetre.querySelector(`input[name="${nom}"]:checked`).value

  // Le tarif à l’heure s’applique jusqu’à ce qu’il dépasse celui de la journée
  function montant() {
    const casier = window.CASIERS.find((c) => c.id === choisi("taille"))
    const heures = Number(choisi("duree"))
    return heures >= 24 ? (heures / 24) * casier.jour : Math.min(heures * casier.heure, casier.jour)
  }
  const euros = (n) => (racine.lang === "fr" ? n.toFixed(2).replace(".", ",") + " €" : "€" + n.toFixed(2))
  function total() { document.getElementById("total").textContent = euros(montant()) }

  // Dessin d’un faux QR code : motif tiré du code PIN, avec les trois repères d’angle
  function qr(graine) {
    const n = 21
    let s = Number(graine) || 1
    const alea = () => ((s = (s * 16807) % 2147483647) % 100) / 100
    const repere = (x, y) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)
    let cases = ""
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (repere(x, y)) continue
      if (alea() > 0.5) cases += `<rect x="${x}" y="${y}" width="1" height="1"/>`
    }
    const coin = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`
    return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" fill="#14213D" shape-rendering="crispEdges">${cases}${coin(0, 0)}${coin(n - 7, 0)}${coin(0, n - 7)}</svg>`
  }

  function ouvrir() {
    etape(1)
    total()
    document.getElementById("r-erreur").hidden = true
    fenetre.showModal()
  }
  document.querySelectorAll("[data-reserver]").forEach((b) => b.addEventListener("click", ouvrir))
  fenetre.addEventListener("change", total)
  // Un clic sur le fond ferme la fenêtre
  fenetre.addEventListener("click", (e) => { if (e.target === fenetre) fenetre.close() })

  fenetre.querySelectorAll("[data-suite]").forEach((b) => b.addEventListener("click", () => {
    const vers = b.dataset.suite
    if (vers === "3") {
      const mail = document.getElementById("r-mail").value.trim()
      const tel = document.getElementById("r-tel").value.replace(/[^\d+]/g, "")
      const valide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) && tel.length >= 9
      document.getElementById("r-erreur").hidden = valide
      if (!valide) return
      const pin = String(Math.floor(100000 + Math.random() * 900000))
      const heures = Number(choisi("duree"))
      const duree = heures >= 24
        ? (racine.lang === "fr" ? `${heures / 24} jour${heures > 24 ? "s" : ""}` : `${heures / 24} day${heures > 24 ? "s" : ""}`)
        : (racine.lang === "fr" ? `${heures} h` : `${heures} hrs`)
      // textContent : la saisie du visiteur n’est jamais interprétée comme du HTML
      document.getElementById("r-recap").textContent = racine.lang === "fr"
        ? `Casier ${choisi("taille")} · ${duree} · ${euros(montant())}. Code envoyé à ${mail}.`
        : `Locker ${choisi("taille")} · ${duree} · ${euros(montant())}. Code sent to ${mail}.`
      document.getElementById("r-pin").textContent = pin
      document.getElementById("r-qr").innerHTML = qr(pin)
    }
    etape(vers)
  }))

  // Liens des partenaires : inactifs dans la démonstration
  document.querySelectorAll("[data-demo]").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()))

  langue(racine.lang === "en" ? "en" : "fr")
})()
