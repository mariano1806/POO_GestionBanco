const readline = require("readline");

const CONFIG = {
  CC_LIMITE_DESCUBIERTO: 5000,     
  CC_COMISION_DESCUBIERTO: 0.05,   
  CA_TASA_INTERES: 0.20           
};

class Banco {
  constructor(nombre, domicilio, listaCuentas = []) {
    this.nombre = (nombre ?? "").toString().trim();
    this.domicilio = (domicilio ?? "").toString().trim();
    this.listaCuentas = Array.isArray(listaCuentas) ? listaCuentas : [];
  }

  creaCuenta(cuenta) {
    if (!cuenta || !cuenta.numeroCuenta) {
      console.log("Cuenta inválida");
      return;
    }
    if (this.buscarCuenta(cuenta.numeroCuenta)) {
      console.log("Ese número de cuenta ya existe");
      return;
    }
    this.listaCuentas.push(cuenta);
  }

  cerrarCuenta(numeroCuenta) {
    const before = this.listaCuentas.length;
    this.listaCuentas = this.listaCuentas.filter(
      (cuenta) => String(cuenta.numeroCuenta) !== String(numeroCuenta)
    );
    if (this.listaCuentas.length === before) {
      console.log("Cuenta inexistente");
    } else {
      console.log(" Cuenta cerrada");
    }
  }

  buscarCuenta(numeroCuenta) {
    return this.listaCuentas.find(
      (cuenta) => String(cuenta.numeroCuenta) === String(numeroCuenta)
    );
  }

  transferir(numOrigen, numDestino, monto) {
    if (String(numOrigen) === String(numDestino)) {
      console.log(" Origen y destino no pueden ser la misma cuenta");
      return false;
    }
    const origen = this.buscarCuenta(numOrigen);
    const destino = this.buscarCuenta(numDestino);
    if (!origen) {
      console.log(" Cuenta origen no encontrada");
      return false;
    }
    if (!destino) {
      console.log(" Cuenta destino no encontrada");
      return false;
    }

    const m = Number(monto);
    if (!isFinite(m) || m <= 0) {
      console.log(" Monto inválido");
      return false;
    }

    if (origen instanceof CuentaAhorro) {
      if (m > origen.consultarSaldo()) {
        console.log(" Fondos insuficientes");
        return false;
      }
      origen.extraer(m);
      destino.depositar(m);
      console.log(` Transferencia realizada. Origen: ${numOrigen} → Destino: ${numDestino}`);
      return true;
    }

    if (origen instanceof CuentaCorriente) {
      const saldo = origen.consultarSaldo();
      const nuevoSaldo = saldo - m;

      if (nuevoSaldo < -CuentaCorriente.LIMITE_DESCUBIERTO) {
        console.log(" Límite de descubierto excedido para la transferencia");
        return false;
      }

      
      let comision = 0;
      if (nuevoSaldo < 0) {
        const descubiertoUsado = Math.abs(nuevoSaldo);
        comision = descubiertoUsado * CuentaCorriente.COSTO_DESCUBIERTO;
      }

      origen._debitarConDescubierto(m, comision); 
      
      destino.depositar(m);

      console.log(
        ` Transferencia realizada. Origen: ${numOrigen} → Destino: ${numDestino} ` +
        (comision > 0 ? `(descubierto usado, comisión ${comision.toFixed(2)})` : "")
      );
      return true;
    }

    console.log(" Tipo de cuenta de origen no soportado para transferencia");
    return false;
  }
}

class Titular {
  constructor(nombre, dni, domicilio) {
    this.nombre = (nombre ?? "").toString().trim();
    this.dni = (dni ?? "").toString().trim();
    this.domicilio = (domicilio ?? "").toString().trim();
  }
}

class Cuenta {
  #saldo;

  constructor(titular, saldo, numeroCuenta) {
    if (!titular) throw new Error("Titular requerido");
    const s = Number(saldo);
    if (!isFinite(s) || s < 0) throw new Error("Saldo inicial inválido");
    if (!numeroCuenta || !String(numeroCuenta).trim()) throw new Error("Número de cuenta requerido");

    this.titular = titular;
    this.#saldo = s;
    this.numeroCuenta = String(numeroCuenta);
  }

  depositar(monto) {
    const m = Number(monto);
    if (!isFinite(m) || m <= 0) {
      console.log(" Monto de depósito inválido");
      return;
    }
    this.#saldo += m;
  }

  extraer(monto) {
    const m = Number(monto);
    if (!isFinite(m) || m <= 0) {
      console.log(" Monto de extracción inválido");
      return false;
    }
    if (m <= this.#saldo) {
      this.#saldo -= m;
      return true;
    } else {
      console.log(" Fondos insuficientes");
      return false;
    }
  }

  consultarSaldo() {
    return this.#saldo;
  }

  _ajustarSaldo(delta) {
    const d = Number(delta);
    if (!isFinite(d)) return;
    this.#saldo += d;
  }
}

class CuentaAhorro extends Cuenta {
  static TASA_INTERES = CONFIG.CA_TASA_INTERES;

  constructor(titular, saldo, numeroCuenta) {
    super(titular, saldo, numeroCuenta);
    this.interesAplicado = false;
    this.tipo = "AHORRO";
  }

  calcularInteres() {
    if (this.interesAplicado) {
      console.log(" Ya se aplicó el interés a esta cuenta.");
      return;
    }
    const interes = this.consultarSaldo() * CuentaAhorro.TASA_INTERES;
    this._ajustarSaldo(interes);
    this.interesAplicado = true;
    console.log(`Interés calculado (${(CuentaAhorro.TASA_INTERES * 100).toFixed(0)}%): ${interes.toFixed(2)}`);
    console.log(` Nuevo saldo con interés: ${this.consultarSaldo().toFixed(2)}`);
  }
}

class CuentaCorriente extends Cuenta {
  static LIMITE_DESCUBIERTO = CONFIG.CC_LIMITE_DESCUBIERTO;
  static COSTO_DESCUBIERTO = CONFIG.CC_COMISION_DESCUBIERTO;

  constructor(titular, saldo, numeroCuenta) {
    super(titular, saldo, numeroCuenta);
    this.tipo = "CORRIENTE";
  }


  extraer(monto) {
    const m = Number(monto);
    if (!isFinite(m) || m <= 0) {
      console.log(" Monto inválido");
      return false;
    }
    const saldoActual = this.consultarSaldo();
    const saldoPosterior = saldoActual - m;

    if (saldoPosterior < -CuentaCorriente.LIMITE_DESCUBIERTO) {
      console.log(" Límite de descubierto excedido");
      return false;
    }

    let comision = 0;
    if (saldoPosterior < 0) {
      const descubiertoUsado = Math.abs(saldoPosterior);
      comision = descubiertoUsado * CuentaCorriente.COSTO_DESCUBIERTO;
    }

    this._ajustarSaldo(-(m + comision));

    if (comision > 0) {
      console.log(`⚠️ Descubierto usado: $${(m - saldoActual > 0 ? (m - saldoActual) : 0).toFixed(2)} | Comisión: $${comision.toFixed(2)}`);
    }
    return true;
  }

  _debitarConDescubierto(monto, comision = 0) {
    const total = Number(monto) + Number(comision);
    const saldoPosterior = this.consultarSaldo() - total;
    if (saldoPosterior < -CuentaCorriente.LIMITE_DESCUBIERTO) {
      throw new Error("Límite de descubierto excedido (transferencia)");
    }
    this._ajustarSaldo(-total);
  }
}

const banco = new Banco("Banco", "Av. Principal 123");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(p) {
  return new Promise((resolve) => rl.question(p, (ans) => resolve(ans)));
}

async function menu() {
  console.log("\n=== MENÚ DEL BANCO ===");
  console.log("1. Crear cuenta");
  console.log("2. Cerrar cuenta");
  console.log("3. Buscar cuenta");
  console.log("4. Depositar");
  console.log("5. Extraer");
  console.log("6. Consultar saldo");
  console.log("7. Calcular interés (Cuenta Ahorro)");
  console.log("8. Solicitar préstamo (Cuenta Corriente)");
  console.log("9. Transferir entre cuentas");  
  console.log("10. Salir");

  const op = await ask("Elegí una opción: ");

  switch (op) {
    case "1":
      await abrirCuentaMenu();
      return menu();

    case "2": {
      const num = await ask("Número de cuenta a cerrar: ");
      banco.cerrarCuenta(num);
      return menu();
    }

    case "3": {
      const num = await ask("Número de cuenta a buscar: ");
      const cuenta = banco.buscarCuenta(num);
      console.log(cuenta
        ? {
            numero: cuenta.numeroCuenta,
            titular: cuenta.titular?.nombre,
            tipo: cuenta.tipo,
            saldo: cuenta.consultarSaldo().toFixed(2),
          }
        : " No encontrada"
      );
      return menu();
    }

    case "4": {
      const num = await ask("Número de cuenta: ");
      const cuenta = banco.buscarCuenta(num);
      if (!cuenta) {
        console.log(" No encontrada");
        return menu();
      }
      const monto = parseFloat(await ask("Monto a depositar: "));
      if (!isFinite(monto) || monto <= 0) {
        console.log(" Monto inválido");
        return menu();
      }
      cuenta.depositar(monto);
      console.log("✅ Depósito realizado");
      return menu();
    }

    case "5": {
      const num = await ask("Número de cuenta: ");
      const cuenta = banco.buscarCuenta(num);
      if (!cuenta) {
        console.log(" No encontrada");
        return menu();
      }
      const monto = parseFloat(await ask("Monto a extraer: "));
      if (!isFinite(monto) || monto <= 0) {
        console.log(" Monto inválido");
        return menu();
      }
      const ok = cuenta.extraer(monto);
      if (ok) console.log(" Operación finalizada");
      return menu();
    }

    case "6": {
      const num = await ask("Número de cuenta: ");
      const cuenta = banco.buscarCuenta(num);
      if (!cuenta) {
        console.log(" No encontrada");
        return menu();
      }
      console.log(` Saldo: ${cuenta.consultarSaldo().toFixed(2)}`);
      return menu();
    }

    case "7": {
      const num = await ask("Número de cuenta: ");
      const cuenta = banco.buscarCuenta(num);
      if (cuenta instanceof CuentaAhorro) {
        cuenta.calcularInteres();
      } else {
        console.log(" La cuenta no es de tipo ahorro");
      }
      return menu();
    }

    case "8": {
      const num = await ask("Número de cuenta (Cuenta Corriente): ");
      const cuenta = banco.buscarCuenta(num);
      if (!(cuenta instanceof CuentaCorriente)) {
        console.log(" La cuenta no es de tipo corriente");
        return menu();
      }
      async function pedirMonto() {
        const monto = parseFloat(await ask("Ingrese monto del préstamo: "));
        if (!isFinite(monto) || monto <= 0) {
          console.log(" Monto inválido");
          return pedirMonto();
        }
        if (monto > CuentaCorriente.LIMITE_DESCUBIERTO) {
          console.log(` El préstamo máximo es ${CuentaCorriente.LIMITE_DESCUBIERTO}`);
          return pedirMonto();
        }
        cuenta.depositar(monto);
        console.log(` Préstamo aprobado: ${monto.toFixed(2)}. Nuevo saldo: ${cuenta.consultarSaldo().toFixed(2)}`);
        return menu();
      }
      return pedirMonto();
    }

    case "9": {
      const origen = await ask("Cuenta origen: ");
      const destino = await ask("Cuenta destino: ");
      const monto = parseFloat(await ask("Monto a transferir: "));
      banco.transferir(origen, destino, monto);
      return menu();
    }

    case "10":
      rl.close();
      return;

    default:
      console.log(" Opción inválida");
      return menu();
  }
}

async function abrirCuentaMenu() {
  const nombre = (await ask("Nombre del titular: ")).trim();
  const dni = (await ask("DNI del titular: ")).trim();
  const dom = (await ask("Domicilio del titular: ")).trim();
  if (!nombre || !dni || !dom) {
    console.log(" Datos del titular inválidos");
    return;
  }
  const titular = new Titular(nombre, dni, dom);

  const saldoStr = await ask("Saldo inicial: ");
  const s = parseFloat(saldoStr);
  if (!isFinite(s) || s < 0) {
    console.log(" Saldo inválido");
    return;
  }

  const numCuenta = (await ask("Número de cuenta: ")).trim();
  if (!numCuenta) {
    console.log(" Número de cuenta inválido");
    return;
  }
  if (banco.buscarCuenta(numCuenta)) {
    console.log(" Ese número de cuenta ya existe");
    return;
  }

  const tipo = await ask("Tipo de cuenta (1=Ahorro, 2=Corriente): ");
  if (tipo === "1") {
    banco.creaCuenta(new CuentaAhorro(titular, s, numCuenta));
    console.log(" Cuenta de ahorro creada con tasa fija 20%");
  } else if (tipo === "2") {
    banco.creaCuenta(new CuentaCorriente(titular, s, numCuenta));
    console.log(" Cuenta corriente creada (con descubierto)");
    console.log(`   Límite descubierto: $${CuentaCorriente.LIMITE_DESCUBIERTO} | Comisión: ${(CuentaCorriente.COSTO_DESCUBIERTO*100).toFixed(0)}%`);
  } else {
    console.log(" Tipo inválido");
  }
}

menu();
