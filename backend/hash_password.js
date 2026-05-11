const bcrypt = require('bcryptjs');

const password = process.argv[2] || process.env.ADMIN_PASS;

if (!password) {
  console.log("Uso: node hash_password.js <sua_senha>");
  console.log("Ou defina a variável de ambiente ADMIN_PASS");
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log("\n==========================================");
  console.log("SEU HASH PARA O .ENV:");
  console.log("==========================================");
  console.log(`ADMIN_PASS_HASH=${hash}`);
  console.log("==========================================\n");
});
