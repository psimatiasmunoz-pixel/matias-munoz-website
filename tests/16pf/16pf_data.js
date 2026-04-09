// 16PF-5 Items Data — 185 ítems
// Cada ítem: [texto, factor, dirección (1=positivo, -1=inverso), opciónA, opciónC]
// Scoring: dir=1 → A=2,?=1,C=0 | dir=-1 → A=0,?=1,C=2

const FACTORS = {
  A:{name:'Afabilidad',code:'A',low:'Fría, reservada, impersonal',high:'Cálida, afable, participativa'},
  B:{name:'Razonamiento',code:'B',low:'Pensamiento concreto',high:'Pensamiento abstracto'},
  C:{name:'Estabilidad',code:'C',low:'Reactiva, emocionalmente cambiante',high:'Estable, adaptada, madura'},
  E:{name:'Dominancia',code:'E',low:'Deferente, cooperadora, sumisa',high:'Dominante, asertiva, competitiva'},
  F:{name:'Animación',code:'F',low:'Seria, reprimida, cuidadosa',high:'Animosa, espontánea, entusiasta'},
  G:{name:'Atención a Normas',code:'G',low:'Inconformista, indulgente',high:'Cumplidora, formal, atenta a reglas'},
  H:{name:'Atrevimiento',code:'H',low:'Tímida, cohibida, temerosa',high:'Atrevida, segura, emprendedora'},
  I:{name:'Sensibilidad',code:'I',low:'Objetiva, nada sentimental, utilitaria',high:'Sensible, esteta, sentimental'},
  L:{name:'Vigilancia',code:'L',low:'Confiada, adaptable, sin sospechas',high:'Vigilante, suspicaz, escéptica'},
  M:{name:'Abstracción',code:'M',low:'Práctica, realista, con los pies en la tierra',high:'Abstraída, imaginativa, idealista'},
  N:{name:'Privacidad',code:'N',low:'Abierta, genuina, llana',high:'Privada, calculadora, discreta'},
  O:{name:'Aprensión',code:'O',low:'Segura, despreocupada, satisfecha',high:'Aprensiva, insegura, preocupada'},
  Q1:{name:'Apertura al Cambio',code:'Q1',low:'Tradicional, apegada a lo familiar',high:'Abierta al cambio, experimental'},
  Q2:{name:'Autosuficiencia',code:'Q2',low:'Seguidora del grupo, se integra',high:'Autosuficiente, individualista'},
  Q3:{name:'Perfeccionismo',code:'Q3',low:'Flexible, tolerante con el desorden',high:'Perfeccionista, organizada, disciplinada'},
  Q4:{name:'Tensión',code:'Q4',low:'Relajada, tranquila, paciente',high:'Tensa, impaciente, intranquila'}
};

// MI = Manipulación de Imagen, IN = Infrecuencia, AQ = Aquiescencia
const VALIDITY_SCALES = {MI:{name:'Manipulación de Imagen'},IN:{name:'Infrecuencia'},AQ:{name:'Aquiescencia'}};

const ITEMS = [
// Factor A — Afabilidad (11 ítems)
["Me resulta fácil hablar con personas que acabo de conocer.","A",1,"Verdadero","Falso"],
["Prefiero trabajar solo/a que en equipo.","A",-1,"Verdadero","Falso"],
["Me gusta asistir a reuniones sociales y fiestas.","A",1,"Verdadero","Falso"],
["Me consideran una persona distante o reservada.","A",-1,"Verdadero","Falso"],
["Disfruto conociendo gente nueva.","A",1,"Verdadero","Falso"],
["Me cuesta expresar mis sentimientos a los demás.","A",-1,"Verdadero","Falso"],
["Me preocupo sinceramente por los problemas de otros.","A",1,"Verdadero","Falso"],
["Prefiero las actividades solitarias a las grupales.","A",-1,"Verdadero","Falso"],
["Me resulta natural ser cariñoso/a con las personas cercanas.","A",1,"Verdadero","Falso"],
["Me siento incómodo/a cuando alguien me cuenta sus problemas personales.","A",-1,"Verdadero","Falso"],
["En general, confío en la buena voluntad de las personas.","A",1,"Verdadero","Falso"],

// Factor B — Razonamiento (15 ítems)
["Si 2 lápices cuestan $100, ¿cuánto cuestan 12 lápices?","B",1,"$600","$500"],
["CALIENTE es a FRÍO como ALTO es a:","B",1,"Bajo","Grande"],
["¿Cuál de estos números no encaja en la serie: 2, 4, 7, 8, 16?","B",1,"7","4"],
["MANO es a GUANTE como PIE es a:","B",1,"Calcetín","Pierna"],
["Si reorganizo las letras 'AECS', obtengo el nombre de un(a):","B",1,"Cosa (SECA)","Animal"],
["¿Qué número sigue: 1, 3, 5, 7, ...?","B",1,"9","8"],
["MEJOR es el opuesto de:","B",1,"Peor","Bueno"],
["Un reloj marca las 3:15. ¿Qué ángulo forman las manecillas aproximadamente?","B",1,"Menos de 10°","90°"],
["DEDO es a MANO como HOJA es a:","B",1,"Árbol","Verde"],
["Si todos los X son Y, y todos los Y son Z, entonces:","B",1,"Todos los X son Z","Algunos X no son Z"],
["¿Qué palabra no pertenece al grupo: mesa, silla, lámpara, sofá?","B",1,"Lámpara","Mesa"],
["Si A es mayor que B, y B es mayor que C, entonces:","B",1,"A es mayor que C","C es mayor que A"],
["RÁPIDO es a VELOZ como LENTO es a:","B",1,"Pausado","Rápido"],
["¿Cuántos meses tienen 28 días?","B",1,"Todos","1"],
["Si 5 máquinas hacen 5 piezas en 5 minutos, ¿cuántas piezas hacen 100 máquinas en 100 minutos?","B",1,"2000","100"],

// Factor C — Estabilidad (11 ítems)
["Me resulta difícil controlar mis emociones en situaciones de estrés.","C",-1,"Verdadero","Falso"],
["Generalmente me siento con ánimo estable y equilibrado.","C",1,"Verdadero","Falso"],
["Pequeños contratiempos me alteran fácilmente.","C",-1,"Verdadero","Falso"],
["Mantengo la calma incluso cuando las cosas salen mal.","C",1,"Verdadero","Falso"],
["Me siento emocionalmente frágil con frecuencia.","C",-1,"Verdadero","Falso"],
["Puedo manejar bien la presión y las demandas del día a día.","C",1,"Verdadero","Falso"],
["Hay días en que me siento sin motivo especialmente triste o irritable.","C",-1,"Verdadero","Falso"],
["Recupero rápidamente mi equilibrio después de una decepción.","C",1,"Verdadero","Falso"],
["Los problemas a veces me hacen sentir que no puedo seguir adelante.","C",-1,"Verdadero","Falso"],
["Me considero una persona emocionalmente madura.","C",1,"Verdadero","Falso"],
["Tiendo a reaccionar de forma exagerada ante las dificultades.","C",-1,"Verdadero","Falso"],

// Factor E — Dominancia (12 ítems)
["Suelo tomar la iniciativa en las discusiones grupales.","E",1,"Verdadero","Falso"],
["Prefiero seguir las instrucciones de otros antes que dar las mías.","E",-1,"Verdadero","Falso"],
["Me gusta tener el control de las situaciones.","E",1,"Verdadero","Falso"],
["Evito los conflictos aunque tenga razón.","E",-1,"Verdadero","Falso"],
["No me importa decir a otros lo que deben hacer.","E",1,"Verdadero","Falso"],
["Me resulta difícil imponer mi punto de vista.","E",-1,"Verdadero","Falso"],
["Soy competitivo/a por naturaleza.","E",1,"Verdadero","Falso"],
["Tiendo a ceder fácilmente ante las opiniones ajenas.","E",-1,"Verdadero","Falso"],
["Me molesta que otros intenten mandarme.","E",1,"Verdadero","Falso"],
["Me siento cómodo/a siendo líder de un grupo.","E",1,"Verdadero","Falso"],
["Acepto sin protestar las decisiones de mis superiores.","E",-1,"Verdadero","Falso"],
["Defiendo firmemente mis derechos cuando creo que tengo razón.","E",1,"Verdadero","Falso"],

// Factor F — Animación (11 ítems)
["Soy una persona animada y entusiasta.","F",1,"Verdadero","Falso"],
["Prefiero actividades tranquilas y reflexivas.","F",-1,"Verdadero","Falso"],
["Me gusta improvisar y ser espontáneo/a.","F",1,"Verdadero","Falso"],
["Tiendo a ser serio/a y prudente.","F",-1,"Verdadero","Falso"],
["Disfruto siendo el centro de atención en las reuniones.","F",1,"Verdadero","Falso"],
["Me describirían como una persona callada y contenida.","F",-1,"Verdadero","Falso"],
["Me emociono fácilmente con las cosas buenas que pasan.","F",1,"Verdadero","Falso"],
["Pienso mucho antes de actuar; rara vez soy impulsivo/a.","F",-1,"Verdadero","Falso"],
["Me cuesta quedarme quieto/a; siempre busco actividad.","F",1,"Verdadero","Falso"],
["Prefiero planificar cuidadosamente antes de divertirme.","F",-1,"Verdadero","Falso"],
["La gente dice que soy una persona alegre y divertida.","F",1,"Verdadero","Falso"],

// Factor G — Atención a Normas (11 ítems)
["Siempre cumplo con mis obligaciones, incluso si no me apetece.","G",1,"Verdadero","Falso"],
["A veces me salto las reglas si creo que no son razonables.","G",-1,"Verdadero","Falso"],
["Soy muy responsable y organizado/a con mis compromisos.","G",1,"Verdadero","Falso"],
["Pienso que a veces hay que ser flexible con las normas.","G",-1,"Verdadero","Falso"],
["Me siento mal si no cumplo con lo que se espera de mí.","G",1,"Verdadero","Falso"],
["No me preocupa demasiado lo que otros piensen de mi conducta.","G",-1,"Verdadero","Falso"],
["Me guío por un fuerte sentido del deber.","G",1,"Verdadero","Falso"],
["A veces postergo las tareas porque no me motivan.","G",-1,"Verdadero","Falso"],
["Creo que seguir las reglas es fundamental para la convivencia.","G",1,"Verdadero","Falso"],
["Tiendo a buscar atajos para terminar las cosas más rápido.","G",-1,"Verdadero","Falso"],
["Las personas me ven como alguien confiable y formal.","G",1,"Verdadero","Falso"],

// Factor H — Atrevimiento (11 ítems)
["Me siento cómodo/a hablando ante un grupo grande.","H",1,"Verdadero","Falso"],
["Evito las situaciones donde puedo ser el centro de atención.","H",-1,"Verdadero","Falso"],
["Disfruto de las experiencias nuevas, incluso si implican riesgo.","H",1,"Verdadero","Falso"],
["Me pongo nervioso/a cuando conozco gente nueva.","H",-1,"Verdadero","Falso"],
["Me lanzo con confianza a situaciones desconocidas.","H",1,"Verdadero","Falso"],
["Me cuesta mucho hablar por teléfono con desconocidos.","H",-1,"Verdadero","Falso"],
["No me asustan los desafíos sociales.","H",1,"Verdadero","Falso"],
["Prefiero quedarme en lo conocido antes que arriesgarme.","H",-1,"Verdadero","Falso"],
["Me resulta fácil iniciar conversaciones con extraños.","H",1,"Verdadero","Falso"],
["Me preocupa hacer el ridículo frente a otros.","H",-1,"Verdadero","Falso"],
["Ante una oportunidad nueva, generalmente me animo a intentarlo.","H",1,"Verdadero","Falso"],

// Factor I — Sensibilidad (11 ítems)
["Me conmueven fácilmente las películas o las historias tristes.","I",1,"Verdadero","Falso"],
["Tomo decisiones basándome en la lógica más que en los sentimientos.","I",-1,"Verdadero","Falso"],
["Aprecio profundamente el arte, la música y la belleza.","I",1,"Verdadero","Falso"],
["Pienso que ser práctico es más importante que ser sensible.","I",-1,"Verdadero","Falso"],
["Me afectan mucho los sufrimientos de otras personas.","I",1,"Verdadero","Falso"],
["Creo que dejarse llevar por las emociones es una debilidad.","I",-1,"Verdadero","Falso"],
["Necesito un ambiente estético agradable para sentirme bien.","I",1,"Verdadero","Falso"],
["Me considero una persona más racional que emocional.","I",-1,"Verdadero","Falso"],
["A veces lloro o me emociono sin razón aparente.","I",1,"Verdadero","Falso"],
["Lo importante son los hechos concretos, no los sentimientos.","I",-1,"Verdadero","Falso"],
["Soy muy sensible a las críticas que recibo.","I",1,"Verdadero","Falso"],

// Factor L — Vigilancia (11 ítems)
["Creo que muchas personas tienen intenciones ocultas.","L",1,"Verdadero","Falso"],
["Confío fácilmente en la gente que conozco.","L",-1,"Verdadero","Falso"],
["Sospecho cuando alguien es demasiado amable conmigo.","L",1,"Verdadero","Falso"],
["Generalmente creo que la gente es honesta.","L",-1,"Verdadero","Falso"],
["Me cuesta perdonar a quienes me han hecho daño.","L",1,"Verdadero","Falso"],
["Acepto las explicaciones de los demás sin cuestionarlas mucho.","L",-1,"Verdadero","Falso"],
["Estoy alerta ante personas que puedan aprovecharse de mí.","L",1,"Verdadero","Falso"],
["Me adapto fácilmente a las personas y situaciones nuevas.","L",-1,"Verdadero","Falso"],
["A veces siento que otros hablan de mí a mis espaldas.","L",1,"Verdadero","Falso"],
["Tiendo a dar el beneficio de la duda a los demás.","L",-1,"Verdadero","Falso"],
["Verifico la información que me dan antes de creerla.","L",1,"Verdadero","Falso"],

// Factor M — Abstracción (11 ítems)
["Me pierdo en mis pensamientos e imaginación con frecuencia.","M",1,"Verdadero","Falso"],
["Soy una persona práctica y con los pies en la tierra.","M",-1,"Verdadero","Falso"],
["Disfruto fantaseando sobre cómo podría ser el mundo.","M",1,"Verdadero","Falso"],
["Me concentro en lo que es real y tangible.","M",-1,"Verdadero","Falso"],
["A veces me olvido de cosas porque estoy ensimismado/a.","M",1,"Verdadero","Falso"],
["Presto atención a los detalles concretos de mi entorno.","M",-1,"Verdadero","Falso"],
["Tengo una imaginación muy activa.","M",1,"Verdadero","Falso"],
["Me aburren las conversaciones puramente teóricas o abstractas.","M",-1,"Verdadero","Falso"],
["Prefiero las ideas originales a las soluciones convencionales.","M",1,"Verdadero","Falso"],
["Me gusta resolver problemas paso a paso, de forma metódica.","M",-1,"Verdadero","Falso"],
["Frecuentemente me distraigo con mis propios pensamientos.","M",1,"Verdadero","Falso"],

// Factor N — Privacidad (11 ítems)
["Prefiero guardarme mis opiniones para mí mismo/a.","N",1,"Verdadero","Falso"],
["Soy una persona abierta; digo lo que pienso sin filtro.","N",-1,"Verdadero","Falso"],
["Me cuido de no revelar demasiado de mí mismo/a.","N",1,"Verdadero","Falso"],
["La gente dice que soy muy transparente y directo/a.","N",-1,"Verdadero","Falso"],
["Pienso bien las cosas antes de compartirlas con otros.","N",1,"Verdadero","Falso"],
["No me importa que los demás sepan todo sobre mí.","N",-1,"Verdadero","Falso"],
["Soy reservado/a con mis asuntos personales.","N",1,"Verdadero","Falso"],
["Hablo espontáneamente, sin calcular el efecto de mis palabras.","N",-1,"Verdadero","Falso"],
["Tiendo a observar antes de participar en una conversación.","N",1,"Verdadero","Falso"],
["Me resulta natural hablar de mis sentimientos con cualquiera.","N",-1,"Verdadero","Falso"],
["Calculo las consecuencias antes de actuar o hablar.","N",1,"Verdadero","Falso"],

// Factor O — Aprensión (12 ítems)
["Me preocupo frecuentemente por cosas que podrían salir mal.","O",1,"Verdadero","Falso"],
["Generalmente me siento seguro/a de mí mismo/a.","O",-1,"Verdadero","Falso"],
["A menudo dudo de mis propias capacidades.","O",1,"Verdadero","Falso"],
["Raramente me siento culpable o arrepentido/a.","O",-1,"Verdadero","Falso"],
["Me preocupa lo que otros piensan de mí.","O",1,"Verdadero","Falso"],
["Afronto las situaciones sin preocuparme excesivamente.","O",-1,"Verdadero","Falso"],
["Tiendo a sentirme culpable aunque no haya hecho nada malo.","O",1,"Verdadero","Falso"],
["Me siento satisfecho/a con la persona que soy.","O",-1,"Verdadero","Falso"],
["Soy más inseguro/a de lo que la gente cree.","O",1,"Verdadero","Falso"],
["Tengo confianza en que las cosas saldrán bien.","O",-1,"Verdadero","Falso"],
["Me reprocho a mí mismo/a cuando cometo errores.","O",1,"Verdadero","Falso"],
["No suelo preocuparme por errores del pasado.","O",-1,"Verdadero","Falso"],

// Factor Q1 — Apertura al Cambio (11 ítems)
["Disfruto probando formas nuevas de hacer las cosas.","Q1",1,"Verdadero","Falso"],
["Prefiero las rutinas y los métodos conocidos.","Q1",-1,"Verdadero","Falso"],
["Me interesan las ideas innovadoras y poco convencionales.","Q1",1,"Verdadero","Falso"],
["Los cambios me generan incomodidad.","Q1",-1,"Verdadero","Falso"],
["Me gusta cuestionar las formas tradicionales de pensar.","Q1",1,"Verdadero","Falso"],
["Valoro las costumbres y tradiciones establecidas.","Q1",-1,"Verdadero","Falso"],
["Busco activamente experiencias y aprendizajes diferentes.","Q1",1,"Verdadero","Falso"],
["Me siento más cómodo/a con lo que ya conozco.","Q1",-1,"Verdadero","Falso"],
["Me adapto rápidamente a las situaciones nuevas.","Q1",1,"Verdadero","Falso"],
["Creo que los valores tradicionales son los más seguros.","Q1",-1,"Verdadero","Falso"],
["La variedad y la novedad me estimulan.","Q1",1,"Verdadero","Falso"],

// Factor Q2 — Autosuficiencia (11 ítems)
["Prefiero tomar mis decisiones sin consultar a nadie.","Q2",1,"Verdadero","Falso"],
["Me gusta hacer las cosas en compañía de otros.","Q2",-1,"Verdadero","Falso"],
["Me siento bien trabajando solo/a durante largos periodos.","Q2",1,"Verdadero","Falso"],
["Busco la opinión del grupo antes de decidir algo importante.","Q2",-1,"Verdadero","Falso"],
["No necesito la aprobación de otros para sentirme bien.","Q2",1,"Verdadero","Falso"],
["Me siento más seguro/a cuando actúo con el respaldo del grupo.","Q2",-1,"Verdadero","Falso"],
["Disfruto de mi propia compañía.","Q2",1,"Verdadero","Falso"],
["Me gusta pertenecer a grupos y organizaciones.","Q2",-1,"Verdadero","Falso"],
["Confío en mi propio juicio más que en el de los demás.","Q2",1,"Verdadero","Falso"],
["Me resulta difícil actuar sin el apoyo de otros.","Q2",-1,"Verdadero","Falso"],
["Resuelvo mis problemas por mí mismo/a.","Q2",1,"Verdadero","Falso"],

// Factor Q3 — Perfeccionismo (11 ítems)
["Me gusta tener todo ordenado y bajo control.","Q3",1,"Verdadero","Falso"],
["No me molesta el desorden si me siento cómodo/a.","Q3",-1,"Verdadero","Falso"],
["Me esfuerzo por hacer las cosas lo mejor posible.","Q3",1,"Verdadero","Falso"],
["A veces dejo las cosas sin terminar.","Q3",-1,"Verdadero","Falso"],
["Planifico cuidadosamente mis actividades diarias.","Q3",1,"Verdadero","Falso"],
["Soy bastante flexible con mis estándares de calidad.","Q3",-1,"Verdadero","Falso"],
["Me exijo mucho a mí mismo/a en todo lo que hago.","Q3",1,"Verdadero","Falso"],
["Prefiero la espontaneidad a la planificación rigurosa.","Q3",-1,"Verdadero","Falso"],
["Me disgusta cometer errores, por pequeños que sean.","Q3",1,"Verdadero","Falso"],
["No me preocupo demasiado por los detalles menores.","Q3",-1,"Verdadero","Falso"],
["Mantengo autodisciplina incluso cuando nadie me supervisa.","Q3",1,"Verdadero","Falso"],

// Factor Q4 — Tensión (11 ítems)
["Me siento inquieto/a o nervioso/a con frecuencia.","Q4",1,"Verdadero","Falso"],
["Soy una persona relajada y tranquila.","Q4",-1,"Verdadero","Falso"],
["Me cuesta quedarme quieto/a; necesito estar en movimiento.","Q4",1,"Verdadero","Falso"],
["Generalmente me siento sereno/a y en paz.","Q4",-1,"Verdadero","Falso"],
["Siento una tensión interna que me resulta difícil de controlar.","Q4",1,"Verdadero","Falso"],
["Puedo relajarme fácilmente después de un día difícil.","Q4",-1,"Verdadero","Falso"],
["Me frustro rápidamente cuando las cosas no salen como espero.","Q4",1,"Verdadero","Falso"],
["Tengo paciencia con las situaciones que no puedo cambiar.","Q4",-1,"Verdadero","Falso"],
["A veces siento una urgencia interna sin saber por qué.","Q4",1,"Verdadero","Falso"],
["Me resulta fácil dejar los problemas de lado y descansar.","Q4",-1,"Verdadero","Falso"],
["Tiendo a acumular tensión hasta que estallo.","Q4",1,"Verdadero","Falso"],

// Ítems de validez MI (Manipulación de Imagen) — 5 ítems (intercalados)
["Nunca he dicho una mentira en mi vida.","MI",1,"Verdadero","Falso"],
["Jamás he sentido envidia de nadie.","MI",1,"Verdadero","Falso"],
["Siempre he sido perfectamente justo/a con todas las personas.","MI",1,"Verdadero","Falso"],
["Nunca me he sentido irritado/a con alguien sin motivo.","MI",1,"Verdadero","Falso"],
["Jamás he tenido un pensamiento del que me avergüence.","MI",1,"Verdadero","Falso"],
];

// Baremos aproximados Chile/España (tabla de conversión PD → Decatipo)
// Formato: {factor: [[min_PD, max_PD, decatipo], ...]}
// Basados en adaptación hispana con ajuste para población chilena
const BAREMOS = {};
const factorKeys = Object.keys(FACTORS);
factorKeys.forEach(f => {
  const maxItems = ITEMS.filter(i => i[1]===f).length;
  const maxPD = maxItems * 2;
  // Distribución normal aproximada: media ≈ maxPD*0.5, SD ≈ maxPD*0.15
  const mean = maxPD * 0.5;
  const sd = maxPD * 0.17;
  BAREMOS[f] = [];
  for (let d = 1; d <= 10; d++) {
    const zLow = -2.25 + (d-1) * 0.5;
    const zHigh = -2.25 + d * 0.5;
    const pdLow = Math.max(0, Math.round(mean + zLow * sd));
    const pdHigh = Math.min(maxPD, Math.round(mean + zHigh * sd));
    BAREMOS[f].push([pdLow, pdHigh, d]);
  }
});
