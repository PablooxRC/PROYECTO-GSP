#!/bin/bash
# Script para facilitar migración de BD en Vercel

echo "🔧 Utilidad para gestionar BD en Vercel Postgres"
echo ""

# Verificar si vercel está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no instalado. Instalando..."
    npm install -g vercel
fi

COMMAND=${1:-help}

case $COMMAND in
    pull)
        echo "📥 Descargando variables de entorno de Vercel..."
        vercel env pull .env.vercel
        echo "✅ Variables guardadas en .env.vercel"
        echo ""
        echo "Para usar estas variables:"
        echo "  export \$(cat .env.vercel | xargs)"
        ;;
    
    init-db)
        echo "🗄️  Inicializando BD en Vercel Postgres..."
        vercel env pull .env.vercel
        export $(cat .env.vercel | xargs)
        npm run seed
        echo "✅ BD inicializada"
        ;;
    
    backup)
        echo "💾 Descargando backup de la BD..."
        echo "📍 Ir a: https://vercel.com/dashboard > Storage > PostgreSQL > Backups"
        echo "💡 Las copias de seguridad se hacen automáticamente"
        ;;
    
    logs)
        echo "📋 Viendo logs en tiempo real..."
        vercel logs --follow
        ;;
    
    *)
        echo "Comandos disponibles:"
        echo ""
        echo "  npm run vercel:pull      - Descargar variables de entorno"
        echo "  npm run vercel:init-db   - Inicializar BD"
        echo "  npm run vercel:backup    - Ver info de backups"
        echo "  npm run vercel:logs      - Ver logs en tiempo real"
        echo ""
        echo "Ejemplo:"
        echo "  npm run vercel:pull"
        echo "  source .env.vercel"
        echo "  npm run seed"
        ;;
esac
