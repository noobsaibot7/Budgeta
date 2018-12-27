// using modular patterns for data encapsulation
// Budget code
const budgetController = (() => {

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1
    }
  
    function Income(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    function Expense(id, description, value) {
        Income.apply(this, arguments);
        this.percentage = -1;
    }

    Expense.prototype.calcExpPercentage= function(totInc){
        totInc >0 ? this.percentage = Math.round(this.value / totInc * 100): this.percentage = -1;
    }

    Expense.prototype.getExpPercentage = function(){
        return this.percentage;
    }

    function addItems(type, des, val) {
        let newItem, ID;


        if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
            ID = 0
        }
        // create new items based on the type 'inc' or 'exp'
        if (type === 'exp') {
            newItem = new Expense(ID, des, val);
        }
        else if (type === 'inc') {
            newItem = new Income(ID, des, val);
        }
        // push in our new data structure

        data.allItems[type].push(newItem);
        // return the new element for the addListItem function
        return newItem;

    }

    function testis() {
        console.log(data)
    }

    function calculateTotal(type){
        let sum = 0;
        data.allItems[type].map(curr => sum += curr.value);
        data.totals[type] = sum;
    }

    function calculateBudget(){
        //calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        //calculate budget = data.sales.inc - data.totals.exp;
        data.budget = data.totals.inc - data.totals.exp;

        //calculate the percentage of in come we spent
        //i.e expense/income * 100
        data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
    }

    function calcPercentages(){
        //take the total income and divide by expenses e.g
        /*
        if totalInc = 100,
            a= 20, % =5:
            b= 50, % = 2:
            i.e expense/totalInc * 100
        */
       data.allItems.exp.forEach(curr => curr.calcExpPercentage(data.totals.inc));
    }

    function getPercentage(){
        let arrVall = data.allItems.exp.map(curr => curr.getExpPercentage());
        return arrVall;
    }

    function getBudget(){
        return {
            budget: data.budget,
            totalInc:data.totals.inc,
            totalExp: data.totals.exp,
            percentage:data.percentage
        }
    }

    function deleteItem(type, ids){
        let allIds, indexNum;
        allIds = data.allItems[type].map(curr=>curr.id);
        //returns all ids in an array

        indexNum = allIds.indexOf(ids);
        if(indexNum !== -1){
            data.allItems[type].splice(indexNum, 1);
        }
    }

    return {
        addItems,
        testis,
        calculateBudget,
        getBudget,
        deleteItem, 
        calcPercentages,
        getPercentage
    }
})();

// both controllers are independent of each other. they dont talk to each other directly
// UI code
const UIController = (() => {
    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel:".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        expPerLabel: ".budget__expenses--percentage",
        containElement: ".container",
        expPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
        
    }

    function inputLabels(obj){
        let val = document.querySelector(DOMStrings.expPerLabel).textContent;
        let type;
        obj.budget > 0 ? type = '+' : type = '-'
        document.querySelector(DOMStrings.budgetLabel).textContent = formatString (type, obj.budget);
        document.querySelector(DOMStrings.incomeLabel).textContent = formatString('inc',obj.totalInc);
        document.querySelector(DOMStrings.expenseLabel).textContent = formatString('exp', obj.totalExp);
        if(obj.percentage >= 0 ){
            val = `${obj.percentage}%`;
        }else if(obj.percentage === Infinity){
            val= '---';
        }else{

        }document.querySelector(DOMStrings.expPerLabel).textContent = '---';

    }

    function getInput() {
        return {
            type: document.querySelector(DOMStrings.inputType).value,
            description: document.querySelector(DOMStrings.inputDescription).value,
            value: parseInt(document.querySelector(DOMStrings.inputValue).value)
        }
    }

    function getDOMStrings() {
        return DOMStrings;
    }

    function displayDate(){
        let month, year, def, monthsArr;
        monthsArr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        def = new Date();
        month = def.getMonth();// returns a nuber of present month
        year = def.getFullYear();

        document.querySelector(DOMStrings.dateLabel).textContent = `${monthsArr[month]} ${year}`
    }

    function formatString(type, numb){
        let num, int, numArr, dec;
        // it should convert besed on either inc or exp 2500 t0 +2,500.00
        //abs function helps to remove + or -
        // toFixed(2) returns a string with 2 numbers after decimal point
        num = Math.abs(numb).toFixed(2);
        numArr = num.split('.');
        int = numArr[0];
        
        dec = numArr[1];
        if(int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, 3); 
        }
        return `${(type === 'exp' ? '-': '+')} ${int}.${dec}`;    
    }

    function addListItem({ id, description, value }, type) {
        // create HTML strings shuffle them based on object type and input text into the html 
        //then insert the html into the DOM aka DOM manipulation
        let html, element; 
        if (type === 'inc'){
            element=DOMStrings.incomeContainer;

            html = `<div class="item clearfix" id="inc-${id}">
                    <div class="item__description">${description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${formatString(type, value)}</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i>del</button>
                        </div>
                    </div>
                    </div>`
        } else if(type === 'exp'){
            element=DOMStrings.expenseContainer;

            html= `<div class="item clearfix" id="exp-${id}">
                        <div class="item__description">${description}</div>
                            <div class="right clearfix">
                            <div class="item__value">${formatString(type, value)}</div>
                            <div class="item__percentage">21%</div>
                            <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i>del</button>
                        </div>
                    </div>
                    </div>`
        }
                //insert the html into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', html); 
    }

    function clearField(){
        let field, elements, fieldArr;
        elements = `${DOMStrings.inputDescription}, ${DOMStrings.inputValue}`;
        //put all the element in a list node
        field = document.querySelectorAll(elements);
        // converting it to an array to iterate over
        fieldArr = [...field];
         fieldArr.map(curr =>curr.value = "");
         fieldArr[0].focus();

    }
    function deleteItem(idName){
        document.getElementById(idName).parentNode.removeChild(document.getElementById(idName))
    }

    function inputExpPercentage(percentageVal){
        let centLabel = document.querySelectorAll(DOMStrings.expPercentageLabel);
        // NOTE, WHEN WRITING  A PURE FUNCTION, NEVER+== EVER DEPEND ON GLOBAL STATE
        // this iterates over the  nodeList

        const nodeListerFn = (nodeList, fn)=>{
            for(let i=0; i<nodeList.length; i++){
                fn(nodeList[i], i);
            }
        };

        nodeListerFn(centLabel, (curr, index) => {
            if(percentageVal[index] > 0){
                curr.textContent =`${percentageVal[index]}%`;
                console.log(curr);
            }else{
                curr.textContent = '---'
            }
            
        })

    }

    function selectTypeChange(){
        let fields, bar, each;
        fields = `${DOMStrings.inputDescription}, ${DOMStrings.inputValue},${DOMStrings.inputType} `;
        each = document.querySelectorAll(fields)
        bar = Array.from(each);
        bar.forEach(curr => curr.classList.toggle('red-focus'));
        // adding the color to our buttons
        document.querySelector(DOMStrings.inputBtn).classList.toggle('red')

    }

    return {
        getInput,        // samething as getinput:getinput
        getDOMStrings,
        addListItem,
        clearField,
        inputLabels,
        deleteItem,
        inputExpPercentage,
        displayDate,
        selectTypeChange
    }
})();


// this links the UIcontroller and the budgetController
// Global app code
const controller = ((budgetCtrl, UICtrl) => {

    const initEventListener = () => {
        const defObj = {
            budget: 0,
            totalInc:0,
            totalExp: 0,
            percentage:0
        };
        const DOM = UICtrl.getDOMStrings();
        UICtrl.displayDate();
        UICtrl.inputLabels(defObj);

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', event => {
            if (event.which == 13 || event.keyCode == 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.containElement).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', changeType);
        console.log('application started');
       
    }

    function changeType(){
        UICtrl.selectTypeChange()
    }

    function ctrlDeleteItem(event){
        let clickEvent, type, id, valueId;
        valueId = event.target.parentNode.parentNode.parentNode.id;

        clickEvent = valueId.split('-');
        // "income-0"
        type = clickEvent[0];
        id = parseInt(clickEvent[1]);
        //delete item fromm data structure
        budgetCtrl.deleteItem(type, id);
         //delete item fromm UI
        UICtrl.deleteItem(valueId)
        // update ui
        updateBudget()

    }

    function updateBudget(){
        // calculate the budget
        budgetCtrl.calculateBudget();
        //return the budget
        let budget = budgetCtrl.getBudget();
        //display the budget on the ui
        UICtrl.inputLabels(budget);
    }

    function updatePercentages(){
        //1. update the percentage
            budgetCtrl.calcPercentages()
        //2. Read percentage from the budget controller
            let val = budgetCtrl.getPercentage()
        //3. update the UI with the new percentages
             UICtrl.inputExpPercentage(val);
    }

    const ctrlAddItem = () => {

        let input, newVal;
        // 1. Get the data input
        input = UICtrl.getInput();
        console.log(input);
        if(input.description && !isNaN(input.value) && input.value > 0){
             //2. Add it to budget controller
            newVal = budgetCtrl.addItems(input.type, input.description, input.value);
            // newVal returns newItem = new Income(ID, des, val); or  newItem = new Expense(ID, des, val);

            //3. Add the item to the UI
            UICtrl.addListItem(newVal, input.type);
            //4 Clear field after entering all inputs
            UICtrl.clearField()

            //5. Calcuate the budget
            updateBudget();
            //6. update the percentages
            updatePercentages()

        }

       
    }


    return {
        initEventListener
    }
})(budgetController, UIController);

controller.initEventListener();
