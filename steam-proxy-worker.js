// STEAM ARKADAŞ TAKİP - CLOUDFLARE WORKER PROXY
// ================================================
// Bu dosyayı Cloudflare Workers'a yapıştırıp deploy edeceksin.
// Amacı: Steam API'nin CORS kısıtlamasını aşıp telefon uygulamasının
// Steam sunucularına güvenli şekilde istek atmasını sağlamak.
//
// KURULUM:
// 1) https://workers.cloudflare.com adresine git, ücretsiz hesap aç
// 2) "Create Worker" / "Deploy" de, varsayılan kodu SİL
// 3) Bu dosyanın tamamını yapıştır
// 4) Sağ üstten "Deploy" e bas
// 5) Sana verilen adresi kopyala (örn: https://steam-proxy.SENIN-ADIN.workers.dev)
// 6) Bu adresi uygulamanın Ayarlar kısmına yapıştıracaksın

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // CORS preflight isteklerine izin ver
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const action = url.searchParams.get("action");
    const key = url.searchParams.get("key");
    const steamid = url.searchParams.get("steamid");
    const steamids = url.searchParams.get("steamids");

    if (!key) {
      return jsonResponse({ error: "API key eksik" }, 400);
    }

    let steamApiUrl;

    if (action === "friendlist") {
      steamApiUrl = `https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=${key}&steamid=${steamid}&relationship=friend`;
    } else if (action === "playersummaries") {
      steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamids}`;
    } else {
      return jsonResponse({ error: "Geçersiz action parametresi" }, 400);
    }

    try {
      const steamRes = await fetch(steamApiUrl);
      const data = await steamRes.json();
      return jsonResponse(data, 200);
    } catch (err) {
      return jsonResponse({ error: "Steam API isteği başarısız", detail: String(err) }, 502);
    }
  },
};

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
