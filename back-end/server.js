/*************************************************************
 * SERVER.JS
 *************************************************************/
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Conexión MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'covinhar_db'
});
db.connect((err)=>{
  if(err){
    console.error(err);
    return;
  }
  console.log('Conectado a MySQL');
});

io.on('connection', (socket)=>{
  console.log('Cliente conectado:', socket.id);
});

/*************************************************************
 * LOGIN
 *************************************************************/
app.post('/api/login',(req,res)=>{
  const { nombre, contrasena }=req.body;
  if(!nombre || !contrasena){
    return res.status(400).json({ message:'Faltan datos' });
  }
  const q='SELECT * FROM users WHERE nombre=? AND contrasena=?';
  db.query(q,[nombre,contrasena],(err,results)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error servidor' });
    }
    if(results.length>0){
      const user=results[0];
      return res.status(200).json({
        message:'Login exitoso',
        token:'fake-jwt-'+Date.now(),
        usuario:user.nombre,
        rol:user.rol
      });
    } else {
      return res.status(401).json({ message:'Credenciales inválidas' });
    }
  });
});

/*************************************************************
 * PRODUCTOS, CORTADORES
 *************************************************************/
app.get('/api/productos',(req,res)=>{
  db.query('SELECT id,nombre FROM productos ORDER BY id',(err,rows)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error al listar productos' });
    }
    res.status(200).json(rows);
  });
});

app.get('/api/cortadores',(req,res)=>{
  db.query('SELECT id,nombre FROM cortadores ORDER BY id',(err,rows)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error cortadores' });
    }
    res.status(200).json(rows);
  });
});

/*************************************************************
 * LISTAR PEDIDOS (usa cantidad_actual)
 *************************************************************/
app.get('/api/pedidos',(req,res)=>{
  let { search, page, limit }=req.query;
  page= page? parseInt(page):1;
  limit= limit? parseInt(limit):10;
  const offset=(page-1)*limit;

  let whereClause=[];
  let params=[];

  if(search && search.trim()!==''){
    whereClause.push(`
      (
        p.numero_factura LIKE ?
        OR p.cliente LIKE ?
        OR p.id IN (
          SELECT a.pedido_id
          FROM asignaciones a
          JOIN cortadores c ON a.cortador_id=c.id
          WHERE c.nombre LIKE ?
        )
      )
    `);
    const likeTerm=`%${search}%`;
    params.push(likeTerm,likeTerm,likeTerm);
  }

  let base=`
    SELECT
      p.id,
      p.numero_factura,
      p.cliente,
      p.fecha_entrega,
      p.hora_entrega,
      p.estado,
      GROUP_CONCAT(CONCAT(prod.nombre,' x ',dp.cantidad_actual) SEPARATOR ' | ') AS productos,
      (
        SELECT GROUP_CONCAT(c.nombre SEPARATOR ',')
        FROM asignaciones a
        JOIN cortadores c ON a.cortador_id=c.id
        WHERE a.pedido_id=p.id
      ) AS cortadores_asignados
    FROM pedidos p
    LEFT JOIN detalle_pedido dp ON p.id=dp.pedido_id
    LEFT JOIN productos prod ON dp.producto_id=prod.id
  `;
  if(whereClause.length>0){
    base+=' WHERE '+whereClause.join(' AND ');
  }
  base+=`
    GROUP BY p.id
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);

  db.query(base, params, (err, results)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error listar pedidos' });
    }

    let count='SELECT COUNT(DISTINCT p.id) as total FROM pedidos p';
    if(whereClause.length>0){
      count+=' WHERE '+whereClause.join(' AND ');
    }
    db.query(count, params.slice(0,-2), (err2,cRes)=>{
      if(err2){
        console.error(err2);
        return res.status(500).json({ message:'Error contar pedidos' });
      }
      const total=cRes[0].total;
      res.status(200).json({
        data:results,
        total,
        page,
        limit
      });
    });
  });
});

/*************************************************************
 * LISTAR ENTREGADOS (usa cantidad_actual)
 *************************************************************/
app.get('/api/pedidos/entregados',(req,res)=>{
  const q=`
    SELECT
      p.id,
      p.numero_factura,
      p.cliente,
      p.fecha_entrega,
      p.hora_entrega,
      p.estado,
      GROUP_CONCAT(CONCAT(prod.nombre,' x ',dp.cantidad_actual) SEPARATOR ' | ') AS products,
      (
        SELECT GROUP_CONCAT(c.nombre SEPARATOR ',')
        FROM asignaciones a
        JOIN cortadores c ON a.cortador_id=c.id
        WHERE a.pedido_id=p.id
      ) AS cortadores_asignados,
      (
        SELECT SUM(ddp.cantidad_actual)
        FROM detalle_pedido ddp
        WHERE ddp.pedido_id=p.id
      ) as sumActual
    FROM pedidos p
    LEFT JOIN detalle_pedido dp ON p.id=dp.pedido_id
    LEFT JOIN productos prod ON dp.producto_id=prod.id
    WHERE p.estado='Entregado'
    GROUP BY p.id
    ORDER BY p.id DESC
  `;
  db.query(q,(err,rows)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error pedidos entregados' });
    }
    res.status(200).json(rows);
  });
});

/*************************************************************
 * GET /api/pedidos/:id
 * => Retornamos cantidad_actual como "cantidad"
 *************************************************************/
app.get('/api/pedidos/:id',(req,res)=>{
  const pid=req.params.id;
  const sql=`
    SELECT
      p.id,
      p.numero_factura,
      p.cliente,
      p.fecha_entrega,
      p.hora_entrega,
      p.estado,
      dp.producto_id,
      prod.nombre as producto_nombre,
      dp.cantidad_actual
    FROM pedidos p
    LEFT JOIN detalle_pedido dp ON p.id=dp.pedido_id
    LEFT JOIN productos prod ON dp.producto_id=prod.id
    WHERE p.id=?
  `;
  db.query(sql,[pid],(err,rows)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error get pedido' });
    }
    if(rows.length===0){
      return res.status(404).json({ message:'Pedido no encontrado' });
    }
    const pedido={
      id: rows[0].id,
      numero_factura: rows[0].numero_factura,
      cliente: rows[0].cliente,
      fecha_entrega: rows[0].fecha_entrega,
      hora_entrega: rows[0].hora_entrega,
      estado: rows[0].estado,
      productos:[]
    };
    rows.forEach(r=>{
      pedido.productos.push({
        productoId: r.producto_id,
        producto_nombre: r.producto_nombre,
        // Aquí “cantidad” = "cantidad_actual"
        cantidad: r.cantidad_actual
      });
    });
    res.status(200).json(pedido);
  });
});

/*************************************************************
 * CREAR PEDIDO
 *************************************************************/
app.post('/api/pedidos',(req,res)=>{
  const { numero_factura, cliente, fecha_entrega, hora_entrega, productos }=req.body;
  if(!numero_factura || !cliente || !productos || productos.length===0){
    return res.status(400).json({ message:'Datos incompletos' });
  }
  const qIns=`
    INSERT INTO pedidos (numero_factura,cliente,fecha_entrega,hora_entrega,estado)
    VALUES (?,?,?,?, '')
  `;
  db.query(qIns,[numero_factura,cliente,fecha_entrega,hora_entrega],(err,result)=>{
    if(err){
      if(err.code==='ER_DUP_ENTRY'){
        return res.status(400).json({ message:'Número de factura duplicado' });
      }
      console.error(err);
      return res.status(500).json({ message:'Error crear pedido' });
    }
    const newId=result.insertId;
    const qDet=`
      INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, cantidad_actual)
      VALUES (?, ?, ?, ?)
    `;
    let c=0;
    productos.forEach((prod)=>{
      db.query(qDet,[newId, prod.productoId, prod.cantidad, prod.cantidad],(err2)=>{
        if(err2) console.error(err2);
        c++;
        if(c===productos.length){
          io.emit('pedidoActualizado',{type:'CREAR_PEDIDO', pedidoId:newId});
          return res.status(200).json({ message:'Pedido creado', pedidoId:newId });
        }
      });
    });
  });
});

/*************************************************************
 * EDITAR PEDIDO
 *************************************************************/
app.put('/api/pedidos/:id',(req,res)=>{
  const pid=req.params.id;
  const { numero_factura, cliente, fecha_entrega, hora_entrega, productos }=req.body;
  if(!numero_factura || !cliente || !productos || productos.length===0){
    return res.status(400).json({ message:'Datos incompletos para actualizar' });
  }
  const qUp=`
    UPDATE pedidos
    SET numero_factura=?, cliente=?, fecha_entrega=?, hora_entrega=?
    WHERE id=?
  `;
  db.query(qUp,[numero_factura,cliente,fecha_entrega,hora_entrega,pid],(err)=>{
    if(err){
      if(err.code==='ER_DUP_ENTRY'){
        return res.status(400).json({ message:'Número de factura duplicado' });
      }
      console.error(err);
      return res.status(500).json({ message:'Error al editar pedido' });
    }
    const qDel=`DELETE FROM detalle_pedido WHERE pedido_id=?`;
    db.query(qDel,[pid],(err2)=>{
      if(err2){
        console.error(err2);
        return res.status(500).json({ message:'Error limpiar detalle' });
      }
      const qDet=`
        INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, cantidad_actual)
        VALUES (?, ?, ?, ?)
      `;
      let count=0;
      productos.forEach((pr)=>{
        db.query(qDet,[pid, pr.productoId, pr.cantidad, pr.cantidad],(err3)=>{
          if(err3) console.error(err3);
          count++;
          if(count===productos.length){
            io.emit('pedidoActualizado',{type:'EDITAR_PEDIDO', pedidoId:pid});
            return res.status(200).json({ message:'Pedido actualizado ok' });
          }
        });
      });
    });
  });
});

/*************************************************************
 * POST /api/asignaciones
 * (No se borran en reactivar; sólo aquí al reasignar)
 *************************************************************/
app.post('/api/asignaciones',(req,res)=>{
  const { pedidoId, cortadores }=req.body;
  if(!pedidoId || !cortadores || cortadores.length===0){
    return res.status(400).json({ message:'Datos incompletos' });
  }
  const qDel=`DELETE FROM asignaciones WHERE pedido_id=?`;
  db.query(qDel,[pedidoId],(err)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error al limpiar asignaciones' });
    }
    const qIns=`INSERT INTO asignaciones (pedido_id, cortador_id) VALUES (?,?)`;
    let c=0;
    cortadores.forEach(cid=>{
      db.query(qIns,[pedidoId, cid],(err2)=>{
        if(err2) console.error(err2);
        c++;
        if(c===cortadores.length){
          io.emit('pedidoActualizado',{type:'ASIGNAR_CORTADORES', pedidoId});
          return res.status(200).json({ message:'Cortadores asignados correctamente' });
        }
      });
    });
  });
});

/*************************************************************
 * GET /api/pedidos-cortador/:cortadorId
 * => Usa cantidad_actual
 *************************************************************/
app.get('/api/pedidos-cortador/:cortadorId',(req,res)=>{
  const cid=req.params.cortadorId;
  const sql=`
    SELECT
      p.id,
      p.numero_factura,
      p.cliente,
      p.fecha_entrega,
      p.hora_entrega,
      p.estado,
      GROUP_CONCAT(CONCAT(prod.nombre,' x ',dp.cantidad_actual) SEPARATOR ' | ') AS productos
    FROM pedidos p
    JOIN asignaciones a ON p.id=a.pedido_id
    JOIN cortadores c ON a.cortador_id=c.id
    LEFT JOIN detalle_pedido dp ON p.id=dp.pedido_id
    LEFT JOIN productos prod ON dp.producto_id=prod.id
    WHERE c.id=?
    GROUP BY p.id
    ORDER BY p.id DESC
  `;
  db.query(sql,[cid],(err,rows)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error al cargar pedidos de cortador' });
    }
    res.status(200).json(rows);
  });
});

/*************************************************************
 * CAMBIAR ESTADO (PUT /api/pedidos/:id/estado)
 * -> "Cortando" => fecha_hora_cortando
 * -> "Listo" => fecha_hora_listo
 * -> "Entregado" => no se hace aquí, sino en /entregas
 *************************************************************/
app.put('/api/pedidos/:id/estado',(req,res)=>{
  const pedidoId=req.params.id;
  const { nuevoEstado, cortadorId }=req.body;
  if(!nuevoEstado){
    return res.status(400).json({ message:'Estado no proporcionado' });
  }

  if(nuevoEstado==='Cortando'){
    if(!cortadorId){
      return res.status(400).json({ message:'cortadorId requerido para estado Cortando' });
    }
    const q=`UPDATE asignaciones SET fecha_hora_cortando=NOW() WHERE pedido_id=? AND cortador_id=?`;
    db.query(q,[pedidoId,cortadorId],(err,result)=>{
      if(err){
        console.error(err);
        return res.status(500).json({ message:'Error setear Cortando' });
      }
      updatePedidoEstado(pedidoId,nuevoEstado,res);
    });
  }
  else if(nuevoEstado==='Listo'){
    if(!cortadorId){
      return res.status(400).json({ message:'cortadorId requerido para estado Listo' });
    }
    const q=`UPDATE asignaciones SET fecha_hora_listo=NOW() WHERE pedido_id=? AND cortador_id=?`;
    db.query(q,[pedidoId,cortadorId],(err,result)=>{
      if(err){
        console.error(err);
        return res.status(500).json({ message:'Error setear Listo' });
      }
      updatePedidoEstado(pedidoId,nuevoEstado,res);
    });
  }
  else {
    // Recibido, etc.
    updatePedidoEstado(pedidoId,nuevoEstado,res);
  }
});

function updatePedidoEstado(pedidoId,nuevoEstado,res){
  const qUp=`UPDATE pedidos SET estado=? WHERE id=?`;
  db.query(qUp,[nuevoEstado,pedidoId],(err,result)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error cambiar estado' });
    }
    if(result.affectedRows===0){
      return res.status(404).json({ message:'Pedido no encontrado' });
    }
    io.emit('pedidoActualizado',{type:'CAMBIAR_ESTADO', pedidoId, nuevoEstado});
    return res.status(200).json({ message:'Estado actualizado a '+nuevoEstado });
  });
}

/*************************************************************
 * ENTREGAR => "Entregado"
 *************************************************************/
app.post('/api/pedidos/:id/entregas',(req,res)=>{
  const pedidoId=req.params.id;
  const { productosAEntregar }=req.body;
  if(!productosAEntregar || productosAEntregar.length===0){
    return res.status(400).json({ message:'No hay productos a entregar' });
  }
  verificarCantidadesEntrega(pedidoId, productosAEntregar, res);
});

function verificarCantidadesEntrega(pedidoId, prodEntregar, res){
  // Miramos dp.cantidad_actual
  const sql=`
    SELECT dp.producto_id, dp.cantidad_actual as cantDisp
    FROM detalle_pedido dp
    WHERE dp.pedido_id=?
  `;
  db.query(sql,[pedidoId],(err,rows)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error ver cantidad' });
    }
    let mapDisp={};
    rows.forEach(r=>{
      mapDisp[r.producto_id] = r.cantDisp;
    });

    for(let item of prodEntregar){
      const pId=item.productoId;
      const ctd=item.cantidad;
      if(mapDisp[pId]==null){
        return res.status(400).json({
          message:'El producto '+pId+' no existe o ya está en 0'
        });
      }
      if(ctd>mapDisp[pId]){
        return res.status(400).json({
          message:`No puede entregar ${ctd} de producto ${pId}; solo quedan ${mapDisp[pId]}`
        });
      }
    }
    insertarEntregas(pedidoId, prodEntregar, res);
  });
}

function insertarEntregas(pedidoId, prodEntregar, res){
  const qIns=`
    INSERT INTO historial_entregas (pedido_id, producto_id, cantidad_entregada, fecha_entrega)
    VALUES (?, ?, ?, NOW())
  `;
  let cnt=0;
  prodEntregar.forEach(item=>{
    db.query(qIns,[pedidoId, item.productoId, item.cantidad],(err)=>{
      if(err) console.error(err);
      // No restamos doble: asumimos TRIGGER o lo hacemos aquí
      // => Eliminamos cualquier "doble descuento"
      const qUp=`UPDATE detalle_pedido
                 SET cantidad_actual = cantidad_actual - ?
                 WHERE pedido_id=? AND producto_id=?`;
      db.query(qUp,[item.cantidad, pedidoId, item.productoId]);

      cnt++;
      if(cnt===prodEntregar.length){
        marcarEntregado(pedidoId,res);
      }
    });
  });
}

function marcarEntregado(pedidoId,res){
  const qUp=`UPDATE pedidos SET estado='Entregado' WHERE id=?`;
  db.query(qUp,[pedidoId],(err,result)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error set Entregado' });
    }
    io.emit('pedidoActualizado',{type:'ENTREGA', pedidoId, nuevoEstado:'Entregado'});
    return res.status(200).json({ message:'Entrega registrada. Estado: Entregado' });
  });
}

/*************************************************************
 * REACTIVAR (solo estado='', no se borran asignaciones)
 *************************************************************/
app.put('/api/pedidos/:id/reactivar',(req,res)=>{
  const pid=req.params.id;
  const qUp=`UPDATE pedidos SET estado='' WHERE id=?`;
  db.query(qUp,[pid],(err2,result)=>{
    if(err2){
      console.error(err2);
      return res.status(500).json({ message:'Error reactivar' });
    }
    if(result.affectedRows===0){
      return res.status(404).json({ message:'Pedido no encontrado' });
    }
    io.emit('pedidoActualizado',{type:'REACTIVAR',pedidoId:pid});
    return res.status(200).json({ message:'Pedido reactivado ok (manteniendo asignaciones)' });
  });
});

/*************************************************************
 * DELETE PEDIDO
 *************************************************************/
app.delete('/api/pedidos/:id',(req,res)=>{
  const pedidoId=req.params.id;
  const qCheck=`SELECT * FROM asignaciones WHERE pedido_id=?`;
  db.query(qCheck,[pedidoId],(err,rows)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error al verificar asignación' });
    }
    if(rows.length>0){
      return res.status(400).json({ message:'No se puede eliminar; tiene cortador asignado.' });
    }
    const qDel=`DELETE FROM pedidos WHERE id=?`;
    db.query(qDel,[pedidoId],(err2,result)=>{
      if(err2){
        console.error(err2);
        return res.status(500).json({ message:'Error al eliminar pedido' });
      }
      if(result.affectedRows===0){
        return res.status(404).json({ message:'Pedido no encontrado' });
      }
      io.emit('pedidoActualizado',{type:'ELIMINAR_PEDIDO', pedidoId});
      return res.status(200).json({ message:'Pedido eliminado' });
    });
  });
});

/*************************************************************
 * RANKING
 *************************************************************/
app.get('/api/ranking',(req,res)=>{
  const q=`
    SELECT c.id, c.nombre,
      IFNULL(SUM(he.cantidad_entregada),0) as totalEntregado,
      AVG(TIMESTAMPDIFF(HOUR, a.fecha_hora_cortando, a.fecha_hora_listo)) as tiempoPromedio
    FROM cortadores c
    LEFT JOIN historial_entregas he ON c.id=he.cortador_id
    LEFT JOIN asignaciones a ON c.id=a.cortador_id
    GROUP BY c.id
    ORDER BY totalEntregado DESC
  `;
  db.query(q,(err,rows)=>{
    if(err){
      console.error(err);
      return res.status(500).json({ message:'Error ranking' });
    }
    res.status(200).json(rows);
  });
});

const PORT=3000;
server.listen(PORT,()=>{
  console.log(`Servidor en http://localhost:${PORT}`);
});
