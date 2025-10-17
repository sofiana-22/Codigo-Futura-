const StellarSdk = require('@stellar/stellar-sdk');


const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

const SECRET_KEY = 'SECRET KEY';


const destinatarios = [
  { publicKey: "GCDIJ4WO6FF6XCZ5RDI5XGCVC6TFZA63EFLY5O6I4USJNFQLJ4OYVIC3", memo: "Pago-001" },
  { publicKey: "GCQIVKWPLYGR3EK2JHUAJZIS4HMTO7FGDHQMUUE5SBHTWXXZQF7MZ7RK", memo: "Pago-002" },
  { publicKey: "GDCV4NX7DT6YANGJPB3LAXMYRLKU4ZVXVQKVYZM2IRFX6M4W6KKB3K7E", memo: "Pago-003" }
];

async function enviarPago(destinatario, amount, memo) {
  try {
    console.log(`\n💸 Procesando ${memo}...`);
    console.log(`📧 Destinatario: ${destinatario.substring(0, 8)}...`);
    
    // Paso 1: Cargar tu cuenta
    const sourceKeys = StellarSdk.Keypair.fromSecret(SECRET_KEY);
    const sourceAccount = await server.loadAccount(sourceKeys.publicKey());
    
    console.log(`Balance actual: ${sourceAccount.balances[0].balance} XLM\n`);
    
    // Paso 2: Construir transacción
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: networkPassphrase
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: destinatario,
        asset: StellarSdk.Asset.native(),
        amount: amount.toString()
      }))
      .addMemo(memo ? StellarSdk.Memo.text(memo) : StellarSdk.Memo.none())
      .setTimeout(30)
      .build();
    
    // Paso 3: Firmar
    transaction.sign(sourceKeys);
    
    // Paso 4: Enviar
    const result = await server.submitTransaction(transaction);
    
    console.log('🎉 ¡PAGO EXITOSO!\n');
    console.log(`💰 Enviaste: ${amount} XLM`);
    console.log(`🔗 Hash: ${result.hash}\n`);
    
    return result;
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    if (error.response && error.response.data) {
      console.error('Detalles:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Sistema de pagos automatizado
async function enviarPagosAutomatizados() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('  🚀 SISTEMA DE PAGOS AUTOMATIZADO');
  console.log('╚═══════════════════════════════════════════╝');
  
  const resultados = [];
  
  for (let i = 0; i < destinatarios.length; i++) {
    const dest = destinatarios[i];
    
    try {
      console.log(`\n[${i + 1}/${destinatarios.length}] Enviando 2 XLM...`);
      
      const resultado = await enviarPago(dest.publicKey, '2', dest.memo);
      
      resultados.push({
        destinatario: dest.publicKey,
        memo: dest.memo,
        hash: resultado.hash,
        estado: '✅ Exitoso'
      });
      
      console.log('✅ Transacción completada exitosamente');
      console.log('─────────────────────────────────────────');
      
    } catch (error) {
      console.error(`❌ Error en ${dest.memo}:`, error.message);
      
      resultados.push({
        destinatario: dest.publicKey,
        memo: dest.memo,
        hash: 'N/A',
        estado: '❌ Fallido'
      });
      
      // Continuar con el siguiente pago aunque este falle
      console.log('─────────────────────────────────────────');
    }
  }
  
  // Mostrar resumen final
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('  📊 RESUMEN DE TRANSACCIONES');
  console.log('╚═══════════════════════════════════════════╝\n');
  
  resultados.forEach((res, index) => {
    console.log(`${index + 1}. ${res.memo}`);
    console.log(`   Estado: ${res.estado}`);
    console.log(`   Destinatario: ${res.destinatario.substring(0, 8)}...`);
    console.log(`   Hash: ${res.hash !== 'N/A' ? res.hash.substring(0, 16) + '...' : 'N/A'}\n`);
  });
  
  const exitosos = resultados.filter(r => r.estado === '✅ Exitoso').length;
  const fallidos = resultados.filter(r => r.estado === '❌ Fallido').length;
  
  console.log(`✅ Exitosos: ${exitosos}`);
  console.log(`❌ Fallidos: ${fallidos}`);
  console.log(`📝 Total: ${resultados.length}`);
}

// Ejecutar el sistema de pagos automatizados
enviarPagosAutomatizados();
