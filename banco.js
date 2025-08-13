class Banco {
  constructor(nombre, domicilio, listaCuentas) {
    this.nombre = nombre;
    this.domicilio = domicilio;
    this.listaCuentas = listaCuentas;
  }
abrirCuenta(titular, saldo, numeroCuenta) {
  this.listaCuentas.push(new Cuenta(titular, saldo, numeroCuenta));
}

cerrarCuenta(numeroCuenta) {
  this.listaCuentas = this.listaCuentas.filter(
    (cuenta) => cuenta.numeroCuenta !== numeroCuenta
  );
}

buscarcuenta(numeroCuenta) {
  return this.listaCuentas.find(
    (cuenta) => cuenta.numeroCuenta === numeroCuenta
  );
}
}

class Titular {
  constructor(nombre, dni, domicilio) {
    this.nombre = nombre;
    this.dni = dni;
    this.domicilio = domicilio;
  }
}

class Cuenta {
  #saldo;

  constructor(titular, saldo, numeroCuenta) {
    this.titular = titular;
    this.#saldo = saldo;
    this.numeroCuenta = numeroCuenta;
  }

  depositar(monto) {
    this.#saldo += monto;
  }

  extraer(monto) {
    if (monto <= this.#saldo) {
      this.#saldo -= monto;
    } else {
      console.log("Fondos insuficientes");
    }
  }

  consultarSaldo() {
    return this.#saldo;
  }
}

class CuentaAhorro extends Cuenta {
  constructor(titular, saldo, numeroCuenta, tasaInteres) {
    super(titular, saldo, numeroCuenta);
    this.tasaInteres = tasaInteres;
  }
calcularInteres() {
  return this.consultarSaldo() * this.tasaInteres;
}
}

class CuentaCorriente extends Cuenta {
  constructor(titular, saldo, numeroCuenta,limiteDescubierto) {
    super(titular, saldo, numeroCuenta);
    this.limiteDescubierto = limiteDescuebierto;
  }

  extraer(monto) {
    if (monto <= this.consultarSaldo() + this.limiteDescubierto) {
      super.extraer(monto);
    } else {
      console.log("Fondos insuficientes");
    }
  }
}

