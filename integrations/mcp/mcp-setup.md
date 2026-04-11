# Integrasi MCP — Model Context Protocol

## Deskripsi
Menghubungkan Claude Code dengan alat eksternal melalui MCP (Model Context Protocol) untuk memperluas kemampuan tim AI.

## MCP yang Direkomendasikan

### 1. Notion MCP (Task Management)
```json
{
  "mcpServers": {
    "notion": {
      "type": "url",
      "url": "https://mcp.notion.com/mcp",
      "name": "notion-mcp"
    }
  }
}
```
**Fungsi:** Membaca dan memperbarui task board Notion
**Digunakan oleh:** Semua agen (via `/task-check`)

### 2. Image Generation MCP
Pilih salah satu layanan image generation:

#### Opsi A: Nano Banana (Gemini API)
```json
{
  "mcpServers": {
    "image-gen": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-image-gen"],
      "env": {
        "GEMINI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

#### Opsi B: Custom Image Generation Server
```json
{
  "mcpServers": {
    "image-gen": {
      "type": "url",
      "url": "YOUR_MCP_SERVER_URL",
      "name": "image-gen"
    }
  }
}
```

**Fungsi:** Generate gambar untuk konten sosial media, ads, dan marketing materials
**Digunakan oleh:** @social-creative-designer

### 3. Google Drive MCP (Opsional)
```json
{
  "mcpServers": {
    "gdrive": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-gdrive"],
      "env": {
        "GOOGLE_CLIENT_ID": "YOUR_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET": "YOUR_CLIENT_SECRET"
      }
    }
  }
}
```
**Fungsi:** Akses file Google Drive (data klien, assets, dll)
**Digunakan oleh:** Semua agen

### 4. Brave Search MCP (Market Research)
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-brave-search"],
      "env": {
        "BRAVE_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```
**Fungsi:** Riset pasar, kompetitor, tren industri
**Digunakan oleh:** @campaign-strategist

## Cara Setup MCP di Claude Code

### Via VS Code:
1. Buka Command Palette (Ctrl+Shift+P)
2. Cari "Claude: Open Settings"
3. Tambahkan konfigurasi MCP di `mcpServers`
4. Restart Claude Code session

### Via Terminal (Claude Code CLI):
```bash
# Tambahkan MCP server
claude mcp add notion --type url --url "https://mcp.notion.com/mcp"

# Atau via settings file
claude config set mcpServers.notion.type url
claude config set mcpServers.notion.url "https://mcp.notion.com/mcp"
```

### Via Project Settings (.claude/settings.json):
```json
{
  "mcpServers": {
    "notion": {
      "type": "url",
      "url": "https://mcp.notion.com/mcp",
      "name": "notion-mcp"
    },
    "image-gen": {
      "command": "npx",
      "args": ["-y", "YOUR_IMAGE_MCP_PACKAGE"],
      "env": {
        "API_KEY": "YOUR_KEY"
      }
    }
  }
}
```

## Cara Menggunakan MCP dalam Workflow

### Image Generation Flow:
```
1. @social-creative-designer menerima brief desain
2. Buat prompt berdasarkan brand guidelines
3. Panggil MCP image-gen untuk generate gambar
4. Review dan adjust jika perlu
5. Compose final design (image + text overlay)
6. Simpan di workspace/social-media/[klien]/visuals/
```

### Notion Task Flow:
```
1. User menjalankan /task-check
2. Claude query Notion MCP: "Get all pages where Status = To-Do"
3. Parse tasks dan prioritaskan
4. Execute setiap task dengan agen yang sesuai
5. Update Notion: Status → Complete, tambah Output Link
```

## Troubleshooting

### MCP tidak terkoneksi:
- Pastikan API key sudah benar
- Cek apakah package MCP sudah terinstall
- Restart Claude Code session
- Verifikasi di terminal: `claude mcp list`

### Image generation gagal:
- Cek quota API
- Simplify prompt
- Coba dengan resolusi lebih rendah
- Fallback ke code-based design (SVG/HTML)

### Notion tidak bisa diakses:
- Re-authorize Notion connection
- Pastikan database sudah di-share ke integration
- Cek permission level
