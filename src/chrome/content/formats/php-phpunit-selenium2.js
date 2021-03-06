////////////////////////////////////////////////////////////////////////
// Selenium IDE
// PHP Formatter for PHPUnit_Extentions_Selenium2TestCase
////////////////////////////////////////////////////////////////////////

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/webdriver.js', this);

function useSeparateEqualsForArray() {
    return true;
}

function testClassName(testName) {
    return testName.split(/[^0-9A-Za-z]+/).map(
	function(x) {
            return capitalize(x);
	}).join('Test');
}

function testMethodName(testName) {
    return "test" + testClassName(testName);
}

function nonBreakingSpace() {
    return "\"\\u00a0\"";
}

function array(value) {
    var str = 'array(';
    for ( var i = 0; i < value.length; i++) {
	str += string(value[i]);
	if (i < value.length - 1)
	    str += ", ";
    }
    str += ')';
    return str;
};

Equals.prototype.toString = function() {
    return this.e1.toString() + " == " + this.e2.toString();
};

Equals.prototype.assert = function() {
    return "$this->assertEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
    return verify(this.assert());
};

NotEquals.prototype.toString = function() {
    return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
    return "$this->assertNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.verify = function() {
    return verify(this.assert());
};

function joinExpression(expression) {
    return "implode(',', " + expression.toString() + ")";
}

function statement(expression) {
    var s = expression.toString();
    if (s.length == 0) {
	return null;
    }
    return s + ';';
}

function assignToVariable(type, variable, expression) {
    return "$" + variable + " = " + expression.toString();
}

variableName = function(value) {
    return "$" + value;
};

function ifCondition(expression, callback) {
    return "if (" + expression.toString() + ") {\n" + callback() + "}";
}

function assertTrue(expression) {
    return "$this->assertTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
    return "$this->assertFalse(" + expression.toString() + ");";
}

function verify(statement) {
    return "try {\n" +
	indents(1) + statement + "\n" +
	"} catch (PHPUnit_Framework_AssertionFailedError $e) {\n" +
	indents(1) + "array_push($this->verificationErrors, $e->__toString());\n" +
	"}";
}

function verifyTrue(expression) {
    return verify(assertTrue(expression));
}

function verifyFalse(expression) {
    return verify(assertFalse(expression));
}

RegexpMatch.prototype.toString = function() {
    return "(bool)preg_match('/" + this.pattern.replace(/\//g, "\\/") + "/'," + this.expression + ")";
};

function waitFor(expression) {
    return "for ($second = 0; ; $second++) {\n" +
        indent(1) + 'if ($second >= 60) $this->fail("timeout");\n' +
        indent(1) + "try {\n" +
        indent(2) + (expression.setup ? expression.setup() + " " : "") +
        indent(2) + "if (" + expression.toString() + ") break;\n" +
        indent(1) + "} catch (Exception $e) {}\n" +
        indent(1) + "sleep(1);\n" +
        "}\n";
}

function assertOrVerifyFailure(line, isAssert) {
    var message = '"expected failure"';
    var failStatement = "fail(" + message + ");";
    return "try { " + line + " " + failStatement + "} catch (Exception $e) {}";
};

function pause(milliseconds) {
    return "usleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
    return "print(" + xlateArgument(message) + ");";
}

function formatComment(comment) {
    return comment.comment.replace(/.+/mg, function(str) {
	return "// " + str;
    });
}

/**
 * Returns a string representing the suite for this formatter language.
 *
 * @param testSuite  the suite to format
 * @param filename   the file the formatted suite will be saved as
 */
function formatSuite(testSuite, filename) {
    var suiteClass = /^(\w+)/.exec(filename)[1];
    suiteClass = suiteClass[0].toUpperCase() + suiteClass.substring(1);

    var formattedSuite = "<phpunit>\n"
	+ indents(1) + "<testsuites>\n"
	+ indents(2) + "<testsuite name='" + suiteClass + "'>\n";

    for (var i = 0; i < testSuite.tests.length; ++i) {
	var testClass = testSuite.tests[i].getTitle();
	formattedSuite += indents(3)
            + "<file>" + testClass + "<file>\n";
    }

    formattedSuite += indents(2) + "</testsuite>\n"
	+ indents(1) + "</testsuites>\n"
	+ "</phpunit>\n";

    return formattedSuite;
}

function defaultExtension() {
    return this.options.defaultExtension;
}

this.options = {
    receiver: '',
    environment: '*chrome',
    extendedClass: 'PHPUnit_Extensions_Selenium2TestCase',
    indent: '4',
    initialIndents: '2',
    showSelenese: 'false',
    defaultExtension: 'php'
};

options.header =
    "<?php\n" 
    + "\n" 
    + "class ${className} extends ${extendedClass}\n"
    + "{\n" 
    + indents(1) + "/**\n"
    + indents(1) + " * Setup\n"
    + indents(1) + " */\n"
    + indents(1) + "public function setUp()\n"
    + indents(1) + "{\n"
    + indents(2) + "\$this->setBrowser('firefox');\n"
    + indents(2) + "\$this->setHost('127.0.0.1');\n"
    + indents(2) + "\$this->setPort(4444);\n"
    + indents(2) + "\$this->setBrowserUrl('${baseURL}');\n"
    + indents(1) + "}\n"
    + indents(1) + "\n"
    + indents(1) + "/** \n"
    + indents(1) + " * Method ${methodName} \n"
    + indents(1) + " * @test \n"
    + indents(1) + " */ \n"
    + indents(1) + "public function ${methodName}()\n"
    + indents(1) + "{\n";

options.footer =
    indents(1) + "}\n"
    + "\n"
    + "}\n";


this.configForm =
    '<description>Variable for Selenium instance</description>' +
    '<textbox id="options_receiver" />' +
    '<description>Environment</description>' +
    '<textbox id="options_environment" />' +
    '<description>Extended class</description>' +
    '<textbox id="options_extendedClass" />' +
    '<checkbox id="options_showSelenese" label="Show Selenese"/>';

this.name = 'PHPUnit (Selenium2TestCase)';
this.testcaseExtension = '.php';
this.suiteExtension = '.xml';
this.webdriver = true;

WDAPI.Driver = function() {
    this.ref = '$this';
};

WDAPI.Driver.searchContext = function(locatorType, locator) {
    var locatorString = xlateArgument(locator);
    switch (locatorType) {
    case 'xpath':
	return '$this->byXPath(' + locatorString + ')';
    case 'css':
	return '$this->byCssSelector(' + locatorString + ')';
    case 'id':
	return '$this->byId(' + locatorString + ')';
    case 'link':
	return '$this->byLinkText(' + locatorString + ')';
    case 'name':
	return '$this->byName(' + locatorString + ')';
    case 'tag_name':
	return '$this->byTag(' + locatorString + ')';
    }
    throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.prototype.back = function() {
    return this.ref + "->back()";
};

WDAPI.Driver.prototype.close = function() {
    return this.ref + "->close()";
};

WDAPI.Driver.prototype.currentScreenshot = function(filename) { /* utility */
    return "file_put_contents('" + filename + "', "+ this.ref + "->currentScreenshot())";
};

WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
    //return new WDAPI.Element(this.ref + "->findElement(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
    return new WDAPI.Element(WDAPI.Driver.searchContext(locatorType, locator));
};

WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
    //return new WDAPI.ElementList(this.ref + "->findElements(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
    return new WDAPI.ElementList(WDAPI.Driver.searchContext(locatorType, locator));
};

WDAPI.Driver.prototype.getCurrentUrl = function() {
    return this.ref + "->url()";
};

WDAPI.Driver.prototype.get = function(url) {
    if (url.length > 1 && (url.substring(1,8) == "http://" || url.substring(1,9) == "https://")) { // url is quoted
	return this.ref + "->url(" + url + ")";
    } else {
	//return this.ref + "->url($this->baseUrl + " + url + ")";
	return this.ref + "->url(" + url + ")";
    }
};

WDAPI.Driver.prototype.getTitle = function() {
    return this.ref + "->title()";
};

WDAPI.Driver.prototype.refresh = function() {
    return this.ref + "->refresh()";
};

WDAPI.Driver.prototype.isTextPresent = function() {
    return this.ref + "->refresh()";
};




WDAPI.Element = function(ref) {
    this.ref = ref;
};

WDAPI.Element.prototype.clear = function() {
    return this.ref + "->clear()";
};

WDAPI.Element.prototype.click = function() {
    return this.ref + "->click()";
};

WDAPI.Element.prototype.clickAt = function(coordString) { /* utility */
    return "$this->moveto(array(\n"
         + indents(1) + "'element' => " + this.ref + ",\n"
         + indents(1) + "'xoffset' => " + coordString.split(",")[0] + ",\n"
         + indents(1) + "'yoffset' => " + coordString.split(",")[1] + ",\n"
         + "));\n"
         + "$this->click()";
};

WDAPI.Element.prototype.doubleClick = function() { /* utility */
    return "$this->moveto(" + this.ref + ");\n"
         + "$this->doubleclick()";
};

WDAPI.Element.prototype.doubleClickAt = function(coordString) { /* utility */
    return "$this->moveto(array(\n"
         + indents(1) + "'element' => " + this.ref + ",\n"
         + indents(1) + "'xoffset' => " + coordString.split(",")[0] + ",\n"
         + indents(1) + "'yoffset' => " + coordString.split(",")[1] + ",\n"
         + "));\n"
         + "$this->doubleclick()";
};

WDAPI.Element.prototype.dragAndDrop = function(movementsString) { /* utility */
    return "$this->moveto(" + this.ref + ");\n"
         + "$this->buttondown();\n"
         + "$this->moveto(array(\n"
         + indents(1) + "'element' => " + this.ref + ",\n"
         + indents(1) + "'xoffset' => " + this.ref + "->size()['width'] / 2 " + movementsString.split(",")[0] + ",\n"
         + indents(1) + "'yoffset' => " + this.ref + "->size()['height'] / 2 " + movementsString.split(",")[1] + ",\n"
         + "));\n"
         + "$this->buttonup()";
};

WDAPI.Element.prototype.dragAndDropToObject = function(locatorOfDragDestinationObject) { /* utility */
    return "$this->moveto(" + this.ref + ");\n"
         + "$this->buttondown();\n"
         + "$this->moveto(" + WDAPI.Driver.searchContext(locatorOfDragDestinationObject.type, locatorOfDragDestinationObject.string) + ");\n"
         + "$this->buttonup()";
};

WDAPI.Element.prototype.getAttribute = function(attributeName) {
    return this.ref + "->attribute(" + xlateArgument(attributeName) + ")";
};

WDAPI.Element.prototype.getElementHeight = function() { /* rc */
    return this.ref + "->size()['height']";
};

WDAPI.Element.prototype.getElementPositionLeft = function() { /* rc */
    return this.ref + "->location()['x']";
};

WDAPI.Element.prototype.getElementPositionTop = function() { /* rc */
    return this.ref + "->location()['y']";
};

WDAPI.Element.prototype.getElementWidth = function() { /* rc */
    return this.ref + "->size()['width']";
};

WDAPI.Element.prototype.getText = function() {
    return this.ref + "->text()";
};

WDAPI.Element.prototype.isDisplayed = function() {
    return this.ref + "->displayed()";
};

WDAPI.Element.prototype.isSelected = function() {
    return this.ref + "->selected()";
};

WDAPI.Element.prototype.mouseDown = function() { /* utility */
    return "$this->moveto(" + this.ref + ");\n"
         + "$this->buttondown()";
};

WDAPI.Element.prototype.mouseDownAt = function(coordString) { /* utility */
    return "$this->moveto(array(\n"
         + indents(1) + "'element' => " + this.ref + ",\n"
         + indents(1) + "'xoffset' => " + coordString.split(",")[0] + ",\n"
         + indents(1) + "'yoffset' => " + coordString.split(",")[1] + ",\n"
         + "));\n"
         + "$this->buttondown()";
};

WDAPI.Element.prototype.mouseMove = function() { /* utility */
    return "$this->moveto(" + this.ref + ")";
};

WDAPI.Element.prototype.mouseMoveAt = function(coordString) { /* utility */
    return "$this->moveto(array(\n"
         + indents(1) + "'element' => " + this.ref + ",\n"
         + indents(1) + "'xoffset' => " + coordString.split(",")[0] + ",\n"
         + indents(1) + "'yoffset' => " + coordString.split(",")[1] + ",\n"
         + "))";
};

WDAPI.Element.prototype.mouseUp = function() { /* utility */
    return "$this->moveto(" + this.ref + ");\n"
         + "$this->buttonup()";
};

WDAPI.Element.prototype.mouseUpAt = function(coordString) { /* utility */
    return "$this->moveto(array(\n"
         + indents(1) + "'element' => " + this.ref + ",\n"
         + indents(1) + "'xoffset' => " + coordString.split(",")[0] + ",\n"
         + indents(1) + "'yoffset' => " + coordString.split(",")[1] + ",\n"
         + "));\n"
         + "$this->buttonup()";
};

WDAPI.Element.prototype.sendKeys = function(text) {
    return "$this->keys(" + xlateArgument(text) + ")";
};

WDAPI.Element.prototype.submit = function() {
    return this.ref + "->submit()";
};

WDAPI.Element.prototype.select = function(label) {
    return "$this->select(" + this.ref + ")->selectOptionByLabel(" + xlateArgument(label) + ")";
};

WDAPI.Element.prototype.setValue = function(value) {
    return this.ref + "->value(" + xlateArgument(value) + ")";
};

WDAPI.ElementList = function(ref) {
    this.ref = ref;
};

WDAPI.ElementList.prototype.getItem = function(index) {
    return this.ref + "[" + index + "]";
};

WDAPI.ElementList.prototype.getSize = function() {
    return this.ref + "->size()";
};

WDAPI.Utils = function() {
};




//////////////////////////////////////////////////////////////////////
// overwrite webdriver.js
//////////////////////////////////////////////////////////////////////

SeleniumWebDriverAdaptor.prototype.captureEntirePageScreenshot = function(filename, kwargs) { /* utility */
  var driver = new WDAPI.Driver();
  return driver.currentScreenshot(this.rawArgs[0]);
};

SeleniumWebDriverAdaptor.prototype.clickAt = function(elementLocator, coordString) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).clickAt(this.rawArgs[1]);
};

SeleniumWebDriverAdaptor.prototype.doubleClick = function(elementLocator) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).doubleClick();
};

SeleniumWebDriverAdaptor.prototype.doubleClickAt = function(elementLocator, coordString) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).doubleClickAt(this.rawArgs[1]);
};

SeleniumWebDriverAdaptor.prototype.dragAndDrop = function(elementLocator, movementsString) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).dragAndDrop(this.rawArgs[1]);
};

SeleniumWebDriverAdaptor.prototype.dragAndDropToObject = function(locatorOfObjectToBeDragged, locatorOfDragDestinationObject) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var locator_dest = this._elementLocator(this.rawArgs[1]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).dragAndDropToObject(locator_dest);
};

SeleniumWebDriverAdaptor.prototype.getElementHeight = function(elementLocator) { /* rc */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).getElementHeight();
};

SeleniumWebDriverAdaptor.prototype.getElementPositionLeft = function(elementLocator) { /* rc */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).getElementPositionLeft();
};

SeleniumWebDriverAdaptor.prototype.getElementPositionTop = function(elementLocator) { /* rc */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).getElementPositionTop();
};

SeleniumWebDriverAdaptor.prototype.getElementWidth = function(elementLocator) { /* rc */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).getElementWidth();
};

SeleniumWebDriverAdaptor.prototype.mouseDown = function(elementLocator) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).mouseDown();
};

SeleniumWebDriverAdaptor.prototype.mouseDownAt = function(elementLocator, coordString) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).mouseDownAt(this.rawArgs[1]);
};

SeleniumWebDriverAdaptor.prototype.mouseMove = function(elementLocator) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).mouseMove();
};

SeleniumWebDriverAdaptor.prototype.mouseMoveAt = function(elementLocator, coordString) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).mouseMoveAt(this.rawArgs[1]);
};

SeleniumWebDriverAdaptor.prototype.mouseUp = function(elementLocator) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).mouseUp();
};

SeleniumWebDriverAdaptor.prototype.mouseUpAt = function(elementLocator, coordString) { /* utility */
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).mouseUpAt(this.rawArgs[1]);
};


SeleniumWebDriverAdaptor.prototype.isTextPresent = function() {
    var target = this.rawArgs[0];
    return '(bool)strpos(strip_tags($this->source()), ' + "'" + target + "'" + ')';
}

SeleniumWebDriverAdaptor.prototype.type = function(elementLocator, text) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  var webElement = driver.findElement(locator.type, locator.string);
  return webElement.setValue(this.rawArgs[1]);
};
