const StellarSdk = require('@stellar/stellar-sdk');

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const PUBLIC_KEYS = [
  'GB5UVSQLG3R7WD76GFZKBNDI4JJ4BPBHD5PE4JJ56U7SP46NYGQ7M3DQ',
  'GCDIJ4WO6FF6XCZ5RDI5XGCVC6TFZA63EFLY5O6I4USJNFQLJ4OYVIC3',
  'GCQIVKWPLYGR3EK2JHUAJZIS4HMTO7FGDHQMUUE5SBHTWXXZQF7MZ7RK',
  'GDCV4NX7DT6YANGJPB3LAXMYRLKU4ZVXVQKVYZM2IRFX6M4W6KKB3K7E',
  'GDMMJR4A3DDPTNWY7ACIX5GYKZ6LPXABKDL465HEMJK4XYXRIL3WL7NL'
]; // Array de cuentas a monitorear

async function consultarBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    
    // Obtener balance de XLM
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    const balance = xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : '0.00';
    
    // Contar trustlines (todos los balances que no sean nativos)
    const trustlines = account.balances.filter(b => b.asset_type !== 'native').length;
    
    // Obtener sequence number
    const sequenceNumber = account.sequenceNumber();
    
    return {
      publicKey: publicKey,
      balance: balance,
      trustlines: trustlines,
      sequenceNumber: sequenceNumber,
      error: null
    };
    
  } catch (error) {
    return {
      publicKey: publicKey,
      balance: 'N/A',
      trustlines: 'N/A',
      sequenceNumber: 'N/A',
      error: error.response?.status === 404 ? 'Cuenta no encontrada' : error.message
    };
  }
}

// Monitor de múltiples cuentas
async function monitorearCuentas(publicKeys) {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('       🔍 MONITOR DE CUENTAS STELLAR');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  const resultados = [];
  
  for (let i = 0; i < publicKeys.length; i++) {
    console.log(`[${i + 1}/${publicKeys.length}] Consultando cuenta...`);
    
    const resultado = await consultarBalance(publicKeys[i]);
    resultados.push(resultado);
    
    // Mostrar resultado de esta cuenta
    console.log(`\n=== CUENTA ${i + 1} ===`);
    console.log(`Cuenta: ${resultado.publicKey.substring(0, 5)}...${resultado.publicKey.substring(resultado.publicKey.length - 3)}`);
    
    if (resultado.error) {
      console.log(`  ❌ Error: ${resultado.error}`);
    } else {
      console.log(`  💰 Balance: ${resultado.balance} XLM`);
      console.log(`  🔗 Trustlines: ${resultado.trustlines}`);
      console.log(`  🔢 Sequence: ${resultado.sequenceNumber}`);
    }
    
    console.log(''); // Línea en blanco
  }
  
  // Resumen final
  console.log('╔═══════════════════════════════════════════╗');
  console.log('       📊 RESUMEN DEL MONITOREO');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  const cuentasActivas = resultados.filter(r => !r.error).length;
  const cuentasConError = resultados.filter(r => r.error).length;
  
  const balanceTotal = resultados
    .filter(r => !r.error)
    .reduce((sum, r) => sum + parseFloat(r.balance), 0);
  
  const trustlinesTotal = resultados
    .filter(r => !r.error)
    .reduce((sum, r) => sum + r.trustlines, 0);
  
  console.log(`✅ Cuentas activas: ${cuentasActivas}`);
  console.log(`❌ Cuentas con error: ${cuentasConError}`);
  console.log(`💰 Balance total: ${balanceTotal.toFixed(2)} XLM`);
  console.log(`🔗 Trustlines totales: ${trustlinesTotal}`);
  console.log(`📝 Total consultado: ${publicKeys.length} cuentas`);
}

// Ejecutar el monitor
monitorearCuentas(PUBLIC_KEYS);