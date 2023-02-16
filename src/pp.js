const Parser = require('tree-sitter');
const L = require('tree-sitter-l');
const fs = require('fs');
const parser = new Parser();
parser.setLanguage(L);
try{
    var sourceCode = fs.readFileSync('./test_files/example.l','utf8');
} catch (err) {
    console.error(err);
}
const tree = parser.parse(sourceCode);

function p_source(tree){
    const declarations = tree.rootNode.childCount > 1 ? tree.rootNode.child(0) : [];
    const statements = tree.rootNode.childCount > 1 ? tree.rootNode.child(1) : tree.rootNode.child(0);

    return p_statements(statements);
}

function p_declarations(declarations){

}

function p_statements(statements){
    let p_statements = "";

    for(let c_i = 0; c_i < statements.childCount; c_i++){
        let statement = statements.child(c_i);
        switch(statement.type){
            case 'label':
                p_statements += statement.text+'\n';
                break;
            case 'statement':
                p_statements += p_statement(statement);
                break;
            case ';':
                p_statements += statement.text;
                break;
            case '\n':
                p_statements += statement.text;
                break;
        }
    }
    return p_statements;
}

function p_statement(statement){
    if(statement.text == 'syscall'){
        return statement.text;
    }else{
        return p_assignment(statement)
    }
}

function p_assignment(statement){
    return statement.child(0).text+" "+statement.child(1).text+" "+p_expression(statement.child(2));
}

function p_expression(expression){
    var numOfChildren = expression.childCount;
    if(numOfChildren > 2){
        return expression.child(0).text+" "+expression.child(1).text+" "+expression.child(2).text;
    }else{
        return expression.text;
    }
}

var text = p_source(tree);
console.log(text);