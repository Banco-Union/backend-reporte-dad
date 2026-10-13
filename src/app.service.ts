import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { stringify } from 'csv-stringify/sync';
import * as Client from 'ssh2-sftp-client';
import { MailService } from './mail.services'

@Injectable()
export class AppService {

  constructor(
    private readonly entityManager: EntityManager,
    private readonly mailService: MailService
  ) {}


async GetActiva() {
  const data = await this.entityManager.query(
    `SELECT * FROM vw_Rpt_Cartera_Activa`,
  );

  const columnas = data.length > 0
  ? Object.keys(data[0])
  : [];

const formatearFecha = (fecha: Date): string => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};


 const dataNormalizada = data.map((row) => {
  const nuevaFila: Record<string, any> = {};

  for (const columna of columnas) {
    const valor = row[columna];

    if (valor === null || valor === undefined) {
      nuevaFila[columna] = '';
    } else if (valor instanceof Date) {
      nuevaFila[columna] = formatearFecha(valor);
    } else if (typeof valor === 'string') {
      nuevaFila[columna] = valor
        .replace(/[\r\n]+/g, ' ')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        .trim();
    } else {
      nuevaFila[columna] = valor;
    }
  }

  return nuevaFila;
});

const csv = stringify(dataNormalizada, {
  header: true,
  columns: columnas,
  delimiter: ',',
  bom: true,
  record_delimiter: '\r\n',
});
  // Crear carpeta exports
  const rootPath = path.resolve(__dirname, '../');
  const exportDir = path.join(rootPath, 'exports');

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Generar nombre del archivo
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  const nombreArchivo =
    `reporte_Cartera_Activa_${dia}-${mes}-${anio}.csv`;

  const filePath = path.join(exportDir, nombreArchivo);

  // Guardar CSV
  fs.writeFileSync(filePath, csv, 'utf8');

  // Configuración SFTP
  const sftpConfig = {
    host: `${process.env.HOST}`,
    port: 22,
    username: `${process.env.USERSFTP}`,
    password: `${process.env.PASSWORD}`,
    remotePath: `${process.env.REMOTEPATH}`,
  };

  const sftp = await this.connectToSFTP(
    sftpConfig.host,
    sftpConfig.port,
    sftpConfig.username,
    sftpConfig.password,
  );

  const remoteFilePath = path.posix.join(
    sftpConfig.remotePath,
    nombreArchivo,
  );

  try {
    await sftp.put(filePath, remoteFilePath);
    console.log(`CSV subido correctamente a ${remoteFilePath}`);
  } catch (err) {
    console.error('Error al subir el CSV al SFTP:', err);
    throw err;
  } finally {
    await sftp.end();
    console.log('Conexión SFTP cerrada');
  }

  // Eliminar archivo local después de 2 minutos
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error al borrar el archivo: ${filePath}`, err);
      } else {
        console.log(`Archivo eliminado: ${filePath}`);
      }
    });
  }, 2 * 60 * 1000);

  return filePath;
}


async GetCastigada() {
  const data = await this.entityManager.query(
    `SELECT * FROM vw_Rpt_Cartera_Castigada`,
  );

  const columnas = data.length > 0
  ? Object.keys(data[0])
  : [];

const formatearFecha = (fecha: Date): string => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
};


  const dataNormalizada = data.map((row) => {
  const nuevaFila: Record<string, any> = {};

  for (const columna of columnas) {
    const valor = row[columna];

    if (valor === null || valor === undefined) {
      nuevaFila[columna] = '';
    } else if (valor instanceof Date) {
      nuevaFila[columna] = formatearFecha(valor);
    } else if (typeof valor === 'string') {
      nuevaFila[columna] = valor
        .replace(/[\r\n]+/g, ' ')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
        .trim();
    } else {
      nuevaFila[columna] = valor;
    }
  }

  return nuevaFila;
});

const csv = stringify(dataNormalizada, {
  header: true,
  columns: columnas,
  delimiter: ',',
  bom: true,
  record_delimiter: '\r\n',
});

  // Crear carpeta exports
  const rootPath = path.resolve(__dirname, '../');
  const exportDir = path.join(rootPath, 'exports');

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Generar nombre del archivo
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  const nombreArchivo =
    `reporte_Cartera_Castigada_${dia}-${mes}-${anio}.csv`;

  const filePath = path.join(exportDir, nombreArchivo);

  // Guardar CSV
  fs.writeFileSync(filePath, csv, 'utf8');

  // Configuración SFTP
  const sftpConfig = {
    host: `${process.env.HOST}`,
    port: 22,
    username: `${process.env.USERSFTP}`,
    password: `${process.env.PASSWORD}`,
    remotePath: `${process.env.REMOTEPATH}`,
  };

  const sftp = await this.connectToSFTP(
    sftpConfig.host,
    sftpConfig.port,
    sftpConfig.username,
    sftpConfig.password,
  );

  const remoteFilePath = path.posix.join(
    sftpConfig.remotePath,
    nombreArchivo,
  );

  try {
    await sftp.put(filePath, remoteFilePath);
    console.log(`CSV subido correctamente a ${remoteFilePath}`);
  } catch (err) {
    console.error('Error al subir el CSV al SFTP:', err);
    throw err;
  } finally {
    await sftp.end();
    console.log('Conexión SFTP cerrada');
  }

  // Eliminar archivo local después de 2 minutos
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error al borrar el archivo: ${filePath}`, err);
      } else {
        console.log(`Archivo eliminado: ${filePath}`);
      }
    });
  }, 2 * 60 * 1000);

  return filePath;
}


  // async GetCastigada() {

  //   const data = await this.entityManager.query(`SELECT * FROM vw_Rpt_Cartera_Castigada`);

  //     const workbook = new Workbook();
  //     const worksheet = workbook.addWorksheet('Reporte Cartera Castigada');

  //     if (data.length > 0) {
  //       worksheet.columns = Object.keys(data[0]).map((key) => ({
  //         header: key,
  //         key: key,
  //         width: 20,
  //       }));
  //     }

  //     data.forEach((row) => {
  //       worksheet.addRow(row);
  //     });

    

  //     // Crear ruta a carpeta 'exports' en la raíz del proyecto
  //     const rootPath = path.resolve(__dirname, '../'); // sube dos niveles desde src/modules/etc
  //     const exportDir = path.join(rootPath, 'exports');

  //     if (!fs.existsSync(exportDir)) {
  //       fs.mkdirSync(exportDir);
  //     }

  //     const fecha = new Date();

  //     const dia = String(fecha.getDate()).padStart(2, '0');
  //     const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11
  //     const anio = fecha.getFullYear();

  //     const nombreArchivo = `reporte_Cartera_Castigada_${dia}-${mes}-${anio}.csv`;
  //     const filePath = path.join(exportDir, nombreArchivo);
  //     await workbook.xlsx.writeFile(filePath);

      
  //       const sftpConfig = {
  //       host:  `${process.env.HOST}`,
  //       port: 22,
  //       username: `${process.env.USERSFTP}`,
  //       password: `${process.env.PASSWORD}`,
  //       remotePath: `${process.env.REMOTEPATH}`,
  //     };
      
  //       const sftp = await this.connectToSFTP(
  //         sftpConfig.host,
  //         sftpConfig.port,
  //         sftpConfig.username,
  //         sftpConfig.password
  //       );

  //       const remoteFilePath = path.posix.join(sftpConfig.remotePath, nombreArchivo);
  //       try {
  //         await sftp.put(filePath, remoteFilePath);
  //         console.log(`✅ Archivo subido correctamente a ${remoteFilePath}`);
  //       } catch (err) {
  //         console.error('❌ Error al subir el archivo al SFTP:', err);
  //         throw err;
  //       } finally {
  //         await sftp.end();
  //         console.log('🔒 Conexión SFTP cerrada');
  //       }

  //     setTimeout(() => {
  //       fs.unlink(filePath, (err) => {
  //         if (err) {
  //           console.error(`Error al borrar el archivo: ${filePath}`, err);
  //         } else {
  //           console.log(`Archivo eliminado: ${filePath}`);
  //         }
  //       });
  //     }, 2 * 60 * 1000); // 2 minutos

  //     return filePath;
  // }
      
  async connectToSFTP(host: string, port: number, username: string, password: string): Promise<Client> {
        const sftp = new Client();
        try {
            await sftp.connect({
                host,
                port,
                username,
                password,
                readyTimeout:20000,
                keepaliveInterval:10000,
            });
            console.log("Conectado al servidor SFTP");
            return sftp;
        } catch (error) {
            throw new Error(`Error al conectar con SFTP: ${error.message}`);
        }
  }

  async getReportes() {
    console.log('📊 Iniciando carga de reportes...');

    const results = await Promise.allSettled([
      
      this.GetCastigada(),
      this.GetActiva(),
    ]);

    results.forEach(async (result, index) => {
      const taskName = ['GetActiva', 'GetCastigada'][index];

      if (result.status === 'fulfilled') { 

        console.log(`✅ ${taskName} ejecutado correctamente.`);
      } else {
      
              const to = process.env.CORREOSDESTINO;
              const subject = 'Archivios Cartera De Crédito CDD';
              const text = 'Archivos CDD.';
              const html = `Archivos Subidos Correctamente`;

            await this.mailService.sendMail(to as string, subject, text, html);
        console.log(`❌ Error en ${taskName}: ${result.reason}`);
      }
    }); 

      const to = process.env.CORREOSDESTINO;
      const subject = 'Archivios Cartera De Crédito CDD';
      const text = 'Archivos CDD.';
      const html = `Archivos Subidos Correctamente`;

        await this.mailService.sendMail(to as string, subject, text, html);
    return {
          "mensaje":`Archivos Subido Exitosamente en la ruta: ${process.env.HOST}${process.env.REMOTEPATH}`
        }
  }

}
