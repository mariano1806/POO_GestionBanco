## Gestion de Banco - POO - Clase n°5

### Diagrama de clases: 
<img width="797" height="590" alt="gestionBanco" src="https://github.com/user-attachments/assets/bc7fba11-304a-428e-aa03-cc7ba57dbedf" />
#### Explicacion : 
- Multiplicidad 1..* : Relacion uno a muchos
  - Un banco tiene muchas cuentas pero cada cuenta pertenece a un solo banco.
  - Un titular puede tener muchas cuentas pero cada cuenta pertenece a un solo titular.
- 🔷Relacion de composición: Un objeto contiene a otro y la vida del objeto contenido depende del objeto contenedor.
- CuentaCorriente y CajadeAhorro apuntan a la SuperClase Cuenta indicando herencia.
- Cuenta y Titular : Relacion de asociacion.

-----
## Ejecución:
** En la consola escriba `node banco.js`
1. En la consolale aparecera el siguiente menú:
   - El banco no tiene ninguna cuenta almacenada, deberas crear tu cuenta e ingresar tus datos.
   - <img width="367" height="246" alt="menuBanco" src="https://github.com/user-attachments/assets/4b1bc9c0-4eff-4359-a5c2-3cc19052c154" />
2. Una vez creado, selecciona a que tipo de cuenta queres ingresar.
   - En la cuenta de ahorro tu saldo total seria la suma entre el saldo inicial y la taza de interes.
   - En la cuenta corriente el banco te dara un prestamo limitado de no alcanzar el saldo para extraer se le permitira la opcion de `UsarDescubierto`.

