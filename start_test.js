var newman = require('newman');
var curl = require('curlrequest');
var fs = require('fs');
var program = require('commander');

// command_line_parameters = process.argv;
// test_type = command_line_parameters[2];
// environment_option = command_line_parameters[3];

program
  .version('0.1.0')
  .option('-t, --test [type]', 'Nombre del test a ejecutar (solo el prefijo)')
  .option('-e, --environment [type]', 'Nombre del entorno a utilizar (solo el prefijo)')
  .option('-d, --distributed', 'Tipo de pago distribuido (usar para activar)')
  .option('-p, --percentual', 'Distribucion de monto porcentual en pagos distribuidos (usar para activar)')
  .option('-s, --site [type]', 'Sitio a utilizar')
  .option('-b, --subsites [type]', 'Subsitios a utilizar en pagos distribuidos. Separar con comas sin espacios.')
  .parse(process.argv);

if (program.test) {
	console.log('se seleccionó el test ' + program.test);
	collection_file = '/tests/' + program.test + '.postman_collection.json';
} else {
	console.log ('no se definió el test a ejecutar. Test abortado.');
	process.exit();
}

collection_path = require('path').dirname(require.main.filename) + collection_file;

if (!fs.existsSync(collection_path)) {
	console.log ('el test indicado no existe. Test abortado.');
	process.exit();
}

if (program.environment) {
	environment_file = '/environments/' + program.environment + '.postman_environment.json';
} else {
	console.log ('no se definió el entorno a utilizar. Test abortado.');
	process.exit();
}

environment_path = require('path').dirname(require.main.filename) + environment_file;

if (!fs.existsSync(environment_path)) {
	console.log ('la configuracion del entorno indicado no existe. Test abortado.');
	process.exit();
}

function setParameters() {		
	if (program.site) {
		site = program.site;
		console.log('El site a utilizar es ' + program.site);	
	} else {
		console.log('No se recibio un site, se va a utilizar el configurado por default en el test ');
	}
	if (program.subsites) {
		subsites_list = program.subsites.toString().split(',');
		console.log('Los subsites a utilizar son ' + program.subsites);			
	} else {
		console.log('No se recibieron subsites, se van a utilizar los configurados por default en el test ');	
	}
}

function editDtxTest(fileName) {

	String.prototype.escapeSpecialChars = function() {
    	return this.replace(/,/g, ",\n").replace(/{\"/g, "{\n\"").replace('[', '[\n').replace('},\n', '\n},\n').replace('}]', '}\n]\n');
	};


	var file = require(fileName);
	
	file.item[1].request.url =  '{{base_url}}:{{port_replication}}/replication/site/' + site;
	file.item[5].request.url =  '{{base_url}}:{{port_replication}}/replication/site/' + site;

	// Almacena el json raw de los pagos
	var raw_payment_json = JSON.parse(file.item[3].request.body.raw);
	
	
	if (program.percentual) {
	console.log('Pago distribuido por porcentaje activado. No es necesario editar los montos de los subsites, salteando el paso.');	
	} else {	
	raw_payment_json.amount = 1000 * subsites_list.length;

		for (i = 0; i < subsites_list.length; i++) {
			raw_payment_json.sub_payments[i].site_id = subsites_list[i];
			raw_payment_json.sub_payments[i].installments = 5;
			raw_payment_json.sub_payments[i].amount = 1000;			
			console.log('agregado el subsite ' + subsites_list[i]);	
		}
	}

	// Convierte el json raw almacenado en un string
	string_payment_raw = JSON.stringify(raw_payment_json);

	// Escapa los caracteres del json raw para formatearlo de acuerdo al test
	escaped_string_payment_raw = string_payment_raw.escapeSpecialChars();

	//  Reemplaza los json raw del archivo por los nuevos json raw generados
	file.item[3].request.body.raw = escaped_string_payment_raw;

	// Almacena el json raw de los sites
	var raw_sites_json = JSON.parse(file.item[0].request.body.raw);

	// En el json raw, reemplaza el site y los subsites por default por el indicado en los parámetros	
	raw_sites_json.site = site;
	raw_sites_json.subsites = subsites_list;

	// Convierte el json raw almacenado en un string
	string_sites_raw = JSON.stringify(raw_sites_json);

	// Escapa los caracteres del json raw para formatearlo de acuerdo al test
	escaped_string_sites_raw = string_sites_raw.escapeSpecialChars();

	//  Reemplaza los json raw del archivo por los nuevos json raw generados
	file.item[0].request.body.raw = escaped_string_sites_raw;
	file.item[4].request.body.raw = escaped_string_sites_raw;

	// Escribe el archivo del test para almacenar los cambios
	fs.writeFileSync(fileName, JSON.stringify(file, null, 2), function (err) {
	if (err) return console.log(err);
		console.log('Escribiendo en el archivo ' + fileName);
	});

	console.log('El archivo del test fue editado con exito.');
}

// Si el test
function editStxTest(fileName) {
	
	
	// Prepara el reemplazo de caracteres para interpretar el json raw
	String.prototype.escapeSpecialChars = function() {
    	return this.replace(/,/g, ",\n").replace(/{\"/g, "{\n\"").replace('[', '[\n');
	};


	// Requiere el archivo de test 	
	var file = require(fileName);


	// Almacena el json raw
	var raw_amount_json = JSON.parse(file.item[1].request.body.raw);

	// En el json raw, reemplaza el site y los subsites por default por el indicado en los parámetros	
	raw_amount_json.site = site;	

	// Convierte el json raw almacenado en un string
	string_amount_raw = JSON.stringify(raw_sites_json);

	// Escapa los caracteres del json raw para formatearlo de acuerdo al test
	escaped_string_amount_raw = string_amount_raw.escapeSpecialChars();

	//  Reemplaza el json raw del archivo por el nuevo json raw generado
	file.item[1].request.body.raw = escaped_string_amount_raw;

	// Escribe el archivo del test para almacenar los cambios
	fs.writeFileSync(fileName, JSON.stringify(file, null, 2), function (err) {
	if (err) return console.log(err);
		console.log('Escribiendo en el archivo ' + fileName);
	});

	console.log('El archivo del test fue editado con exito.');
}

// Aquí se ejecuta el test que hemos modificado, para realizar pagos en la API
function runTest() {	
	newman.run({
	    	collection: require('.' + collection_file),
		environment: require('.' + environment_file),   				
		reporters: 'cli'
		}, function (err) {
	    	if (err) { throw err; }
	    	console.log('El test fue ejecutado por completo');
	})
}

// Main

if (program.test == 'regresion') {
	console.log('Los parámetros no pueden alterarse durante una regresión.');	
} else {
	setParameters();
	if (program.distributed && program.site && program.subsites) {
		editDtxTest(collection_path);
	} else if (program.site) {
		// editStxTest(collection_path);
	}
}
runTest();

