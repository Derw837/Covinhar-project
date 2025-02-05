-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-02-2025 a las 02:17:59
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `covinhar_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaciones`
--

CREATE TABLE `asignaciones` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `cortador_id` int(11) NOT NULL,
  `fecha_hora_cortando` datetime DEFAULT NULL,
  `fecha_hora_listo` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignaciones`
--

INSERT INTO `asignaciones` (`id`, `pedido_id`, `cortador_id`, `fecha_hora_cortando`, `fecha_hora_listo`) VALUES
(8, 13, 4, '2025-02-02 22:41:18', '2025-02-02 22:41:08'),
(20, 16, 5, '2025-02-02 15:37:19', '2025-02-02 15:37:24'),
(24, 22, 6, NULL, NULL),
(26, 20, 2, NULL, '2025-02-02 22:38:27'),
(27, 15, 3, NULL, '2025-02-02 22:38:59'),
(39, 26, 1, NULL, NULL),
(42, 27, 1, NULL, NULL),
(43, 25, 1, NULL, NULL),
(44, 24, 1, '2025-02-02 23:38:47', '2025-02-02 23:52:26'),
(45, 17, 1, NULL, NULL),
(46, 10, 1, '2025-02-02 23:38:55', NULL),
(47, 28, 1, NULL, '2025-02-02 23:19:08'),
(49, 29, 1, '2025-02-02 23:50:03', '2025-02-02 23:51:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cortadores`
--

CREATE TABLE `cortadores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cortadores`
--

INSERT INTO `cortadores` (`id`, `nombre`) VALUES
(1, 'David'),
(2, 'Jose'),
(3, 'Julio'),
(4, 'Geovanny'),
(5, 'Cesar'),
(6, 'Santiago'),
(7, 'Nery');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `cantidad_actual` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `cantidad_actual`) VALUES
(20, 14, 2, 10, 10),
(22, 13, 1, 1, 1),
(23, 12, 1, 1, 1),
(24, 15, 3, 2, 2),
(28, 17, 5, 2, 0),
(30, 16, 1, 10, 10),
(35, 20, 1, 1, 0),
(38, 10, 1, 100, 0),
(39, 10, 2, 10, 0),
(45, 22, 4, 9, 9),
(46, 24, 5, 15, 3),
(47, 24, 1, 10, 3),
(48, 24, 3, 5, 1),
(50, 25, 3, 10, 10),
(51, 26, 2, 2, 0),
(52, 27, 4, 3, 1),
(53, 28, 1, 10, 0),
(54, 28, 2, 10, -10),
(55, 28, 3, 10, -10),
(56, 28, 4, 10, -10),
(57, 28, 5, 3, -3),
(58, 29, 2, 10, 5),
(59, 29, 3, 10, 1),
(60, 29, 4, 10, 10);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_entregas`
--

CREATE TABLE `historial_entregas` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad_entregada` int(11) NOT NULL,
  `fecha_entrega` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_entregas`
--

INSERT INTO `historial_entregas` (`id`, `pedido_id`, `producto_id`, `cantidad_entregada`, `fecha_entrega`) VALUES
(5, 10, 1, 2, '2025-02-02 22:12:30'),
(6, 10, 1, 2, '2025-02-02 22:13:24'),
(7, 20, 1, 1, '2025-02-02 22:35:15'),
(8, 26, 2, 1, '2025-02-02 21:19:49'),
(9, 26, 2, 1, '2025-02-02 21:46:34'),
(10, 24, 5, 10, '2025-02-02 22:06:35'),
(11, 24, 1, 5, '2025-02-02 22:06:35'),
(12, 24, 3, 2, '2025-02-02 22:06:35'),
(13, 27, 4, 2, '2025-02-02 22:37:58'),
(14, 17, 5, 1, '2025-02-02 22:47:52'),
(15, 24, 5, 1, '2025-02-02 22:49:55'),
(16, 24, 1, 1, '2025-02-02 22:49:55'),
(17, 24, 3, 1, '2025-02-02 22:49:55'),
(18, 28, 1, 5, '2025-02-02 23:19:21'),
(19, 28, 2, 4, '2025-02-02 23:19:21'),
(20, 28, 3, 4, '2025-02-02 23:19:21'),
(21, 28, 4, 4, '2025-02-02 23:19:21'),
(22, 28, 5, 1, '2025-02-02 23:19:21'),
(23, 29, 2, 5, '2025-02-02 23:47:37'),
(24, 29, 3, 9, '2025-02-02 23:51:44');

--
-- Disparadores `historial_entregas`
--
DELIMITER $$
CREATE TRIGGER `trg_historial_entregas_before_insert` BEFORE INSERT ON `historial_entregas` FOR EACH ROW BEGIN
  DECLARE disponible INT;

  SELECT cantidad_actual INTO disponible
  FROM detalle_pedido
  WHERE pedido_id = NEW.pedido_id
    AND producto_id = NEW.producto_id;

  IF (NEW.cantidad_entregada > disponible) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No hay suficiente cantidad para entregar';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `numero_factura` int(50) NOT NULL,
  `cliente` varchar(100) NOT NULL,
  `fecha_entrega` date DEFAULT NULL,
  `hora_entrega` time DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `numero_factura`, `cliente`, `fecha_entrega`, `hora_entrega`, `estado`) VALUES
(10, 212343, 'PABLO SALAZAR', '2025-02-06', '22:17:00', 'Cortando'),
(12, 123445, 'SUSANA CALVACHE', '2025-02-05', '00:00:00', ''),
(13, 13344, 'GUAMAN', '2025-02-05', '15:30:00', 'Cortando'),
(14, 24445, 'DEKOARQ', '2025-02-04', '14:51:00', ''),
(15, 12334, 'OXANA TIMOSHINA', '2025-02-27', '00:41:00', 'Listo'),
(16, 234545, 'PABLO SALAZA', '2025-02-02', '06:59:00', 'Reactivado'),
(17, 44144, 'OLGA MENDa', '2025-02-05', '10:45:00', 'Entregado'),
(20, 123345, 'FERNANDO', '2025-02-04', '18:36:00', 'Listo'),
(22, 234548, 'FERNANDO', '2025-02-13', '20:48:00', 'Entregado'),
(24, 111322, 'CONSUMIDOR FINAL', '2025-02-03', '15:10:00', 'Listo'),
(25, 1233, 'VICENTE FERNANDES', '2025-02-08', '18:00:00', 'Entregado'),
(26, 12344, 'CAMILO SECTO', '2025-02-10', '20:00:00', 'Entregado'),
(27, 221233, 'JULIO JARAMILLO', '2025-02-03', '00:00:00', 'Entregado'),
(28, 545356, 'MARISOL', '2025-02-04', '02:20:00', 'Entregado'),
(29, 874454, 'PABLO MILANES', '2025-02-12', '03:50:00', 'Entregado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`) VALUES
(1, 'Plancha Crudo Pequeña', NULL),
(2, 'Plancha Crudo Grande', NULL),
(3, 'Plancha Laminado Pequeña', NULL),
(4, 'Plancha Laminado Grande', NULL),
(5, 'Retazos', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` varchar(50) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `nombre`, `contrasena`, `rol`) VALUES
(1, 'facturador', 'facturador123', 'facturador'),
(2, 'bodeguero', 'bodeguero123', 'bodeguero'),
(3, 'cortador', 'cortador123', 'cortador'),
(4, 'admin', 'admin123', 'admin'),
(5, 'David', 'david123', 'cortador');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asignaciones`
--
ALTER TABLE `asignaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_asignaciones_pedido` (`pedido_id`),
  ADD KEY `fk_asignaciones_cortador` (`cortador_id`);

--
-- Indices de la tabla `cortadores`
--
ALTER TABLE `cortadores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_detallepedido_pedido` (`pedido_id`),
  ADD KEY `fk_detallepedido_producto` (`producto_id`);

--
-- Indices de la tabla `historial_entregas`
--
ALTER TABLE `historial_entregas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_historialentregas_pedido` (`pedido_id`),
  ADD KEY `fk_historialentregas_producto` (`producto_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_numero_factura` (`numero_factura`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asignaciones`
--
ALTER TABLE `asignaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `cortadores`
--
ALTER TABLE `cortadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT de la tabla `historial_entregas`
--
ALTER TABLE `historial_entregas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asignaciones`
--
ALTER TABLE `asignaciones`
  ADD CONSTRAINT `fk_asignaciones_cortador` FOREIGN KEY (`cortador_id`) REFERENCES `cortadores` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_asignaciones_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `fk_detallepedido_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detallepedido_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_entregas`
--
ALTER TABLE `historial_entregas`
  ADD CONSTRAINT `fk_historialentregas_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historialentregas_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
