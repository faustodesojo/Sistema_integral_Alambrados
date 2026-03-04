// Define valid heights per post type
const VALID_HEIGHTS = {
  'Hormigon Olimpico': ['2m', '1.80m'],
  'Hormigón Recto': ['2m', '1.80m', '1.50m', '1m'],
  'Quebracho Colorado': ['2m', '1.80m', '1.50m', '1.20m', '1m']
};

// Helper function to validate post heights
const validatePostHeight = (type, height) => {
  const validHeights = VALID_HEIGHTS[type];
  if (!validHeights) return true; // Unknown type, skip validation
  return validHeights.includes(height);
};

// Helper to look up a configured product and quantity
const getConfigItem = (typeConfig, role, products) => {
  if (!typeConfig || !typeConfig[role]) return null;
  
  const config = typeConfig[role];
  const product = products.find(p => p.id === config.productId);
  
  return {
    product,
    quantityMultiplier: config.quantity
  };
};

// Helper to calculate additional materials based on opening type
const getOpeningMaterials = (abertura, products, typeConfig) => {
  const materials = [];
  const { ubicacion } = abertura;

  // Get configured products for roles
  const posteRefuerzo = getConfigItem(typeConfig, 'poste_refuerzo', products);
  const planchuela = getConfigItem(typeConfig, 'planchuela', products);
  const puntal = getConfigItem(typeConfig, 'puntal', products);
  const esparrago = getConfigItem(typeConfig, 'esparrago', products);
  const gancho = getConfigItem(typeConfig, 'gancho', products);
  const torniquete = getConfigItem(typeConfig, 'torniquete', products);

  if (ubicacion === 'extremo') {
    // Usually 1 reinforcement post
    if (posteRefuerzo && posteRefuerzo.product) {
      materials.push({
        name: posteRefuerzo.product.name,
        quantity: 1, // Fixed quantity for opening logic
        unitPrice: posteRefuerzo.product.price,
        subtotal: posteRefuerzo.product.price,
        category: 'Aberturas'
      });
    }
  } else if (ubicacion === 'desplazada') {
    // 2 reinforcement posts
    if (posteRefuerzo && posteRefuerzo.product) {
      materials.push({
        name: posteRefuerzo.product.name,
        quantity: 2,
        unitPrice: posteRefuerzo.product.price,
        subtotal: posteRefuerzo.product.price * 2,
        category: 'Aberturas'
      });
    }
    // 2 planchuelas
    if (planchuela && planchuela.product) {
      materials.push({
        name: planchuela.product.name,
        quantity: 2,
        unitPrice: planchuela.product.price,
        subtotal: planchuela.product.price * 2,
        category: 'Aberturas'
      });
    }
    // 2 puntales
    if (puntal && puntal.product) {
      materials.push({
        name: puntal.product.name,
        quantity: 2,
        unitPrice: puntal.product.price,
        subtotal: puntal.product.price * 2,
        category: 'Aberturas'
      });
    }
    // 2 espárragos
    if (esparrago && esparrago.product) {
      materials.push({
        name: esparrago.product.name,
        quantity: 2,
        unitPrice: esparrago.product.price,
        subtotal: esparrago.product.price * 2,
        category: 'Aberturas'
      });
    }
    // 8 ganchos
    if (gancho && gancho.product) {
      materials.push({
        name: gancho.product.name,
        quantity: 8,
        unitPrice: gancho.product.price,
        subtotal: gancho.product.price * 8,
        category: 'Aberturas'
      });
    }
    // 3 torniquetes
    if (torniquete && torniquete.product) {
      materials.push({
        name: torniquete.product.name,
        quantity: 3,
        unitPrice: torniquete.product.price,
        subtotal: torniquete.product.price * 3,
        category: 'Aberturas'
      });
    }
  }

  return materials;
};

export const calculateMaterials = (formData, products, tejidoTypes, materialsConfig, materialsConfigByType) => {
  const {
    tipoPoste,
    altura,
    tejidoId,
    lineas,
    angulos,
    aberturas
  } = formData;

  // Use new detailed config or fallback
  const detailedConfig = materialsConfigByType ? materialsConfigByType : null;
  
  // Get specific configuration for this Type + Height
  let typeConfig = null;
  if (detailedConfig && detailedConfig[tipoPoste] && detailedConfig[tipoPoste][altura]) {
    typeConfig = detailedConfig[tipoPoste][altura];
  }

  if (!typeConfig) {
    console.warn(`Configuration not found for ${tipoPoste} ${altura}`);
    return null;
  }

  // Validate height
  if (!validatePostHeight(tipoPoste, altura)) {
    console.warn(`Height ${altura} is not valid for ${tipoPoste}`);
  }

  // Calculate total metraje for Mesh/Wire
  const totalMetraje = lineas.reduce((sum, linea) => sum + parseFloat(linea.metros || 0), 0);
  const numberOfLines = lineas.length;

  // Retrieve Configured Items
  const posteIntermedioItem = getConfigItem(typeConfig, 'poste_intermedio', products);
  const esquineroItem = getConfigItem(typeConfig, 'poste_refuerzo', products); 
  const puntalItem = getConfigItem(typeConfig, 'puntal', products);
  const planchuelaItem = getConfigItem(typeConfig, 'planchuela', products);
  const torniqueteItem = getConfigItem(typeConfig, 'torniquete', products);
  const ganchoItem = getConfigItem(typeConfig, 'gancho', products);
  const esparragoItem = getConfigItem(typeConfig, 'esparrago', products);
  const alambreItem = getConfigItem(typeConfig, 'alambre', products);
  const hiloPuaItem = getConfigItem(typeConfig, 'hilo_pua', products);

  // === CALCULATIONS ===
  let rawMaterials = [];
  
  // Track line-specific additions for reporting
  const lineDetails = [];

  // --- New Logic per Line ---
  let totalEsquineros = 0;
  let totalIntermedios = 0;
  let totalPuntales = 0;

  lineas.forEach((linea, index) => {
    const length = parseFloat(linea.metros || 0);
    
    // Base calc (existing)
    // 2 Esquineros per line (Start + End)
    totalEsquineros += 2;
    // 2 Puntales per line
    totalPuntales += 2;
    // Intermediate posts: 1 post every 5 meters
    const intermediosForLine = Math.max(0, Math.floor((length - 0.01) / 5));
    totalIntermedios += intermediosForLine;

    // 50m Logic
    // Logic: if <= 50, 0. Else floor(length/50).
    const additionalSets = length <= 50 ? 0 : Math.floor(length / 50);
    
    const lineExtras = [];

    if (additionalSets > 0) {
      // Quantities per set
      const torniqueteQty = tipoPoste === 'Hormigon Olimpico' ? 6 : 3;

      if (esquineroItem && esquineroItem.product) {
         const item = {
            name: esquineroItem.product.name,
            quantity: 2 * additionalSets,
            unitPrice: esquineroItem.product.price,
            subtotal: 2 * additionalSets * esquineroItem.product.price,
            category: 'Refuerzos 50m'
         };
         lineExtras.push(item);
         rawMaterials.push(item);
      }

      if (planchuelaItem && planchuelaItem.product) {
        const item = {
           name: planchuelaItem.product.name,
           quantity: 2 * additionalSets,
           unitPrice: planchuelaItem.product.price,
           subtotal: 2 * additionalSets * planchuelaItem.product.price,
           category: 'Refuerzos 50m'
        };
        lineExtras.push(item);
        rawMaterials.push(item);
      }

      if (esparragoItem && esparragoItem.product) {
         const item = {
           name: esparragoItem.product.name,
           quantity: 2 * additionalSets,
           unitPrice: esparragoItem.product.price,
           subtotal: 2 * additionalSets * esparragoItem.product.price,
           category: 'Refuerzos 50m'
        };
        lineExtras.push(item);
        rawMaterials.push(item);
      }

      if (puntalItem && puntalItem.product) {
         const item = {
           name: puntalItem.product.name,
           quantity: 2 * additionalSets,
           unitPrice: puntalItem.product.price,
           subtotal: 2 * additionalSets * puntalItem.product.price,
           category: 'Refuerzos 50m'
        };
        lineExtras.push(item);
        rawMaterials.push(item);
      }

      if (torniqueteItem && torniqueteItem.product) {
         const item = {
           name: torniqueteItem.product.name,
           quantity: torniqueteQty * additionalSets,
           unitPrice: torniqueteItem.product.price,
           subtotal: torniqueteQty * additionalSets * torniqueteItem.product.price,
           category: 'Refuerzos 50m'
        };
        lineExtras.push(item);
        rawMaterials.push(item);
      }

      if (ganchoItem && ganchoItem.product) {
         const item = {
           name: ganchoItem.product.name,
           quantity: 8 * additionalSets,
           unitPrice: ganchoItem.product.price,
           subtotal: 8 * additionalSets * ganchoItem.product.price,
           category: 'Refuerzos 50m'
        };
        lineExtras.push(item);
        rawMaterials.push(item);
      }
    }

    lineDetails.push({
      lineIndex: index + 1,
      length,
      additionalSets,
      materials: lineExtras
    });
  });

  // Subtract angles from esquineros count
  const anglesCount = parseInt(angulos || 0);
  const totalDeduction = anglesCount;
  
  if (totalDeduction > 0) {
    totalEsquineros = Math.max(0, totalEsquineros - totalDeduction);
  }

  // 1. Esquineros (Postes Extremos/Refuerzo)
  if (esquineroItem && esquineroItem.product) {
    rawMaterials.push({
      name: esquineroItem.product.name,
      quantity: totalEsquineros,
      unitPrice: esquineroItem.product.price,
      subtotal: totalEsquineros * esquineroItem.product.price,
      category: 'Postes'
    });
  }

  // 2. Postes Intermedios
  if (posteIntermedioItem && posteIntermedioItem.product) {
    rawMaterials.push({
      name: `${posteIntermedioItem.product.name}`,
      quantity: totalIntermedios,
      unitPrice: posteIntermedioItem.product.price,
      subtotal: totalIntermedios * posteIntermedioItem.product.price,
      category: 'Postes'
    });
  }

  // 3. Puntales (2 per line logic)
  if (puntalItem && puntalItem.product) {
    rawMaterials.push({
      name: puntalItem.product.name,
      quantity: totalPuntales,
      unitPrice: puntalItem.product.price,
      subtotal: totalPuntales * puntalItem.product.price,
      category: 'Estructura'
    });
  }

  // 4. Tejido (Calculation based on total length minus openings)
  const aberturasMetros = aberturas.reduce((sum, ab) => sum + parseFloat(ab.ancho || 0), 0);
  const effectiveMetraje = totalMetraje - aberturasMetros;
  
  // Select specific tejido based on ID or fallback
  let selectedTejido;
  if (tejidoId) {
    selectedTejido = tejidoTypes.find(t => t.id === parseInt(tejidoId));
  }
  
  if (!selectedTejido) {
    // Fallback logic
    selectedTejido = tejidoTypes.find(t => t.calibre === '14.5' && t.pulgadas === '2.5') || tejidoTypes[0];
  }

  if (selectedTejido && effectiveMetraje > 0) {
    const tejidoName = selectedTejido.name || `Tejido Calibre ${selectedTejido.calibre} - ${selectedTejido.pulgadas}"`;
    rawMaterials.push({
      name: tejidoName,
      quantity: Math.ceil(effectiveMetraje),
      unitPrice: selectedTejido.precio,
      subtotal: Math.ceil(effectiveMetraje) * selectedTejido.precio,
      category: 'Tejido'
    });
  }

  // 5. Planchuelas
  if (planchuelaItem && planchuelaItem.product) {
    const qty = numberOfLines * planchuelaItem.quantityMultiplier; 
    rawMaterials.push({
      name: planchuelaItem.product.name,
      quantity: qty,
      unitPrice: planchuelaItem.product.price,
      subtotal: qty * planchuelaItem.product.price,
      category: 'Accesorios'
    });
  }

  // 6. Torniquetes
  if (torniqueteItem && torniqueteItem.product) {
    const qty = numberOfLines * torniqueteItem.quantityMultiplier;
    rawMaterials.push({
      name: torniqueteItem.product.name,
      quantity: qty,
      unitPrice: torniqueteItem.product.price,
      subtotal: qty * torniqueteItem.product.price,
      category: 'Accesorios'
    });
  }

  // 7. Ganchos
  if (ganchoItem && ganchoItem.product) {
    const qty = numberOfLines * ganchoItem.quantityMultiplier;
    
    rawMaterials.push({
      name: ganchoItem.product.name,
      quantity: qty,
      unitPrice: ganchoItem.product.price,
      subtotal: qty * ganchoItem.product.price,
      category: 'Accesorios'
    });
  }

  // 8. Espárragos
  if (esparragoItem && esparragoItem.product) {
    const qty = numberOfLines * esparragoItem.quantityMultiplier;
    
    rawMaterials.push({
      name: esparragoItem.product.name,
      quantity: qty,
      unitPrice: esparragoItem.product.price,
      subtotal: qty * esparragoItem.product.price,
      category: 'Accesorios'
    });
  }

  // 9. Alambre Liso
  if (alambreItem && alambreItem.product) {
    const qty = Math.ceil(totalMetraje * alambreItem.quantityMultiplier * 3);
    rawMaterials.push({
      name: alambreItem.product.name,
      quantity: qty,
      unitPrice: alambreItem.product.price,
      subtotal: qty * alambreItem.product.price,
      category: 'Accesorios'
    });
  }

  // 10. Hilos de Púa
  if (hiloPuaItem && hiloPuaItem.product) {
    const qty = Math.ceil(totalMetraje * hiloPuaItem.quantityMultiplier);
    rawMaterials.push({
      name: `${hiloPuaItem.product.name} (${hiloPuaItem.quantityMultiplier} líneas)`,
      quantity: qty,
      unitPrice: hiloPuaItem.product.price,
      subtotal: qty * hiloPuaItem.product.price,
      category: 'Accesorios'
    });
  }

  // 11. Aberturas - Add to rawMaterials list
  aberturas.forEach(abertura => {
    const openingMaterials = getOpeningMaterials(abertura, products, typeConfig);
    rawMaterials = [...rawMaterials, ...openingMaterials];
  });

  // === AGGREGATION ===
  // Merge items with the same name
  const aggregatedMaterials = [];
  const materialMap = new Map();

  rawMaterials.forEach(item => {
    if (materialMap.has(item.name)) {
      const existing = materialMap.get(item.name);
      existing.quantity += item.quantity;
      existing.subtotal += item.subtotal;
      // We keep the category of the first occurrence (usually from Line calculation)
    } else {
      // Create a new object to avoid reference issues
      const newItem = { ...item };
      materialMap.set(item.name, newItem);
      aggregatedMaterials.push(newItem);
    }
  });

  const total = aggregatedMaterials.reduce((sum, material) => sum + material.subtotal, 0);

  // Return full object including selected tejido name in summary
  return {
    materials: aggregatedMaterials,
    total,
    lineDetails, // Add line details here
    summary: {
      tipoPoste,
      altura,
      tejido: selectedTejido ? selectedTejido.name : 'N/A',
      totalMetraje,
      angulos: anglesCount,
      aberturas: aberturas.length,
      postesIntermedios: totalIntermedios,
      esquineros: totalEsquineros
    }
  };
};