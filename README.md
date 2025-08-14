# Gestión de Banco - POO (Clase N°5)

### Diagrama de clases: 
- <img width="797" height="590" alt="gestionBanco" src="https://github.com/user-attachments/assets/bc7fba11-304a-428e-aa03-cc7ba57dbedf" />

#### Explicacion del Diagrama: 

- **Multiplicidad 1..***: Relacion uno a muchos
  - Un banco tiene muchas cuentas pero cada cuenta pertenece a un solo banco.
  - Un titular puede tener muchas cuentas pero cada cuenta pertenece a un solo titular.
- **🔷Relacion de composición**: Un objeto contiene a otro y la vida del objeto contenido depende del objeto contenedor.
- CuentaCorriente y CajadeAhorro apuntan a la SuperClase Cuenta indicando **herencia**.
- Cuenta y Titular : Relacion de **asociacion**.

-----
## Ejecución:
1. En la consola escriba
```bash
node banco.js
```
2. En la consola le aparecera el siguiente menú:
   - El banco no tiene ninguna cuenta almacenada, deberas crear tu cuenta e ingresar tus datos.
   - <img width="367" height="246" alt="menuBanco" src="https://github.com/user-attachments/assets/4b1bc9c0-4eff-4359-a5c2-3cc19052c154" />
3. Una vez creado, selecciona a que tipo de cuenta queres ingresar.
   - Cuenta de Ahorro: el saldo total será la suma del saldo inicial más la tasa de interés..
   - Cuenta Corriente: el banco permitirá un préstamo limitado en caso de no tener saldo suficiente para extraer; se podrá usar la opción `UsarDescubierto`.

