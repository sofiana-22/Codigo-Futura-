const StellarSdk = require('@stellar/stellar-sdk');
const fetch = require('node-fetch');
const cuentas = []; // Array para guardar las cuentas

async function crearCuenta(numero) {
console.log(`🔐 Generando cuenta ${numero}...\n`); 
  const pair = StellarSdk.Keypair.random();
  
  console.log('✅ ¡Cuenta creada!\n');
  console.log('📧 PUBLIC KEY (puedes compartir):');
  console.log(pair.publicKey());
  console.log('\n🔑 SECRET KEY (NUNCA COMPARTIR):');
  console.log(pair.secret());
  
  console.log('\n💰 Fondeando con Friendbot...');
  
  try {
    const response = await fetch(
      `https://friendbot.stellar.org/?addr=${pair.publicKey()}`
    );
    
    const result = await response.json();
    
    if (result.successful || response.ok) { 
        console.log('✅ ¡Cuenta fondeada con 10,000 XLM!\n');
        console.log('🔗 Transaction hash:', result.hash);
        
        // Guardar la cuenta en el array
        cuentas.push({
            numero: numero,
            publicKey: pair.publicKey(),
            secretKey: pair.secret(),
            balance: '10000.0000000'});
        }
  
    } catch (error) {
    console.error('❌ Error al fondear:', error.message);
  }
  
  console.log('\n⚠️  IMPORTANTE: Guarda estas llaves en un lugar seguro\n');
  return pair;
}

// Función principal que crea múltiples cuentas
async function crearCuentasMasivas() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('  🚀 CREACIÓN MASIVA DE CUENTAS STELLAR');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  for (let i = 1; i <= 5; i++) {
    await crearCuenta(i);
    console.log('─────────────────────────────────────────\n');
  }
  
  // Mostrar resumen al final
  console.log('╔═══════════════════════════════════════════╗');
  console.log('  📊 RESUMEN DE CUENTAS CREADAS');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  cuentas.forEach((cuenta, index) => {
    console.log(`Cuenta ${cuenta.numero}:`);
    console.log(`  Public Key: ${cuenta.publicKey}`);
    console.log(`  Secret Key: ${cuenta.secretKey}`);
    console.log(`  Balance: ${cuenta.balance} XLM\n`);
  });
  
  console.log(`✅ Total de cuentas creadas: ${cuentas.length}`);
}

// Ejecutar la creación masiva
crearCuentasMasivas();