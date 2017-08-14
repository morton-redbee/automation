var newman = require('newman');
var curl = require('curlrequest');
var fs = require('fs');

command_line_parameters = process.argv;
test_type = command_line_parameters[2];
environment_option = command_line_parameters[3];

if (test_type) {
	console.log('se seleccionó el test ' + test_type);
	collection_file = '/' + test_type + '.postman_collection.json';
	console.log(collection_file);
} else {
	console.log ('no se definió el test a ejecutar. Test abortado.');
	process.exit();
}

collection_path = require('path').dirname(require.main.filename) + collection_file;

if (!fs.existsSync(collection_path)) {
	console.log ('el test indicado no existe. Test abortado.');
	process.exit();
}

if (environment_option) {
	environment_file = '/' + environment_option + '.postman_environment.json';
	console.log(environment_file);
} else {
	console.log ('no se definió el entorno a utilizar. Test abortado.');
	process.exit();
}

environment_path = require('path').dirname(require.main.filename) + environment_file;

if (!fs.existsSync(environment_path)) {
	console.log ('la configuracion del entorno indicado no existe. Test abortado.');
	process.exit();
}

parameters = require('./parameters.json');

function setParameters() {		
	if (parameters.site) {
		site = parameters.site;
	}
	if (parameters.subsites) {
		subsites_list = parameters.subsites.toString().split(',');		
	}
}

function editDtxTest(fileName) {

	String.prototype.escapeSpecialChars = function() {
    	return this.replace(/,/g, ",\n").replace(/{\"/g, "{\n\"").replace('[', '[\n').replace('},\n', '\n},\n').replace('}]', '}\n]\n');
	};


	var file = require(fileName);
	
	file.item[1].request.url =  '{{base_url}}:{{port_replication}}/replication/site/' + site;
	file.item[5].request.url =  '{{base_url}}:{{port_replication}}/replication/site/' + site;

	var raw_payment_json = JSON.parse(file.item[3].request.body.raw);
	
	raw_payment_json.amount = 1000 * subsites_list.length;

	for (i = 0; i < subsites_list.length; i++) {
		raw_payment_json.sub_payments[i].site_id = subsites_list[i];
		raw_payment_json.sub_payments[i].installments = 5;
		raw_payment_json.sub_payments[i].amount = 1000;			
		console.log('agregado el subsite');	
	}

	string_payment_raw = JSON.stringify(raw_payment_json);

	escaped_string_payment_raw = string_payment_raw.escapeSpecialChars();

	file.item[3].request.body.raw = escaped_string_payment_raw;

	var raw_sites_json = JSON.parse(file.item[0].request.body.raw);

	raw_sites_json.site = site;
	raw_sites_json.subsites = subsites_list;

	string_sites_raw = JSON.stringify(raw_sites_json);

	escaped_string_sites_raw = string_sites_raw.escapeSpecialChars();

	file.item[0].request.body.raw = escaped_string_sites_raw;
	file.item[4].request.body.raw = escaped_string_sites_raw;

	fs.writeFileSync(fileName, JSON.stringify(file, null, 2), function (err) {
	if (err) return console.log(err);
		console.log(JSON.stringify(file));
		console.log('writing to ' + fileName);
	});

	console.log('Iteration Data file was edited successfully.');
}

function editStxTest(fileName) {
	
	String.prototype.escapeSpecialChars = function() {
    	return this.replace(/,/g, ",\n").replace(/{\"/g, "{\n\"").replace('[', '[\n');
	};

	var file = require(fileName);

	var raw_payment_json = JSON.parse(file.item[1].request.body.raw);

	string_payment_raw = JSON.stringify(raw_payment_json);

	escaped_string_payment_raw = string_payment_raw.escapeSpecialChars();

	file.item[1].request.body.raw = escaped_string_payment_raw;

	fs.writeFileSync(fileName, JSON.stringify(file, null, 2), function (err) {
	if (err) return console.log(err);
		console.log(JSON.stringify(file));
		console.log('writing to ' + fileName);
	});

	console.log('Iteration Data file was edited successfully.');
}

// Test que prueba realizar un pago a través de la API
function runTest() {	
	newman.run({
	    	collection: require('.' + collection_file),
		environment: require('.' + environment_file),   				
		reporters: 'cli'
		}, function (err) {
	    	if (err) { throw err; }
	    	console.log('collection run complete!');
	});
}

// Main

setParameters();
if (test_type.indexOf('dtx') > -1) {
	editDtxTest(collection_path);
} else if (test_type.indexOf('stx') > -1) {
	editStxTest(collection_path);
}
runTest();

