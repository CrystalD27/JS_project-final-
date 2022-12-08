
//1.將productList 接API並顯示在網頁上
//1.1做資料相加，先小步測試是否有印在DOM上
//1.2開renderPorductList函式，讓getProductList()帶入(由於後續也會用到字串相加並顯示在列表，故將它寫成renderProductList函式) 

function init() {
    renderProductList()
}
const productList = document.querySelector(".productWrap");
let productListData = [];//變數，將資料放入
axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then((response) => {
        //console.log(response.data.products)//開函式，要去確認結果是在在console中打getProductionList(), 確認是否有接收成功
        productListData = response.data.products;
        renderProductList(productListData);
    })
function renderProductList(productListData) {
    let str = "";
    productListData.forEach(item => {
        // console.log(item)

        str += `<li class="productCard">
        <h4 class="productType">新品</h4>
         <img src="${item.images}"
             alt="">
         <a href="#" class="addCardBtn" item-id="${item.id}">加入購物車</a>
         <h3>${item.title}</h3>
         <del class="originPrice">NT$${thousands_separators(item.origin_price)}</del>
         <p class="nowPrice">NT$${thousands_separators(item.price)}</p>
         </li>`;
    })
    productList.innerHTML = str;//印出於HTML

}


//2.將選取選單對應呈現在HTML列表
//2.1開getSelectData函式，並寫入條件
//2.2開getSelectData函式，做全部＆篩選資料
//2.3getProductList()帶入－>帶入和渲染寫成一個函式帶入使用
const productSelect = document.querySelector(".productSelect")
const shoppingCartList = document.querySelector(".shoppingCart-tableList")//若只有在這需要用到可以只寫這，若會重複用到，要抓到外面
//console.log(productSelect)
productSelect.addEventListener("change", () => {
    // console.log(productSelect.value)
    getSelectData(productSelect.value);
})
function getSelectData(selectList) {
    //  console.log(selectList)
    let catchData = [];

    if (selectList === "全部") {
        console.log(productListData)
        catchData = productListData;
        renderProductList(productListData)
    } else {
        catchData = productListData.filter((item) => selectList === item.category)
        //console.log(catchData)
        renderProductList(catchData);
    }
}
//3.加入購物車
//3.1 要取到產品id的值
//3.2 做productList 監聽->在先前字串中加上 item-id="${item.id}" （同步在html上加上?)
//3.3在productList 監聽 抓到item-id
//3.4排錯，讓使用者只在加入購物車按鈕上有反應
//3.5取得購物車列表（接入購物車API文件）
//調整購物車tr結構（加上tag trhead,trbody,trfooter)並在tbody新增class,因為後續跑資料要用到這部分
//綁監聽要綁在大範圍或小範圍？看css結構決定
//3.6使用post去加入購物車//邏輯：點購物車資料會自動+1
//3.7需要渲染，讓他在購物列表顯示，故可以將axios.get ,,,cart 這裡加上getCartList()，帶入渲染
productList.addEventListener("click", (e) => {
    e.preventDefault(); //一般會在按鈕上寫回到首頁，若寫此函式，他就不會亂跳頁面了//取消預設觸發行為
    //console.log(e.target.getAttribute("item-id"))//getAttribut("")抓屬性的值
    let addCartClass = e.target.getAttribute("class")

    if (addCartClass !== "addCardBtn") { //假如class屬性不等於"addCardBtn"，代表沒點在btn
        //alert("wrong place")
        return;//中斷
    }
    let productId = e.target.getAttribute("item-id") //post 需求資料1
    console.log(productId)//否則顯示console.log(productId)->取的產品ID

    let checkNum = 1; //post 需求資料2
    cartData.forEach((item) => {
        if (item.product.id === productId) {
            checkNum = item.quantity += 1;
        }
    })
    //console.log(checkNum)驗證按加入購物車後是否數量有加1
    //先看post後端資料格式需要需求資料1和2，並將他照形式帶入
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, { //注意post寫法axios.post(``,{}).then(()=>{})

        "data": {
            "productId": productId,
            "quantity": checkNum
        }

    }).then((response) => {
        console.log(response);
        alert("加入購物車")
        getCartList();
    })

})
let cartData = [];
function getCartList() {

    let str = "";
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then((response) => {
            //console.log(response.data)
            //console.log(response.data.finalTotal)
            document.querySelector(".cart-sum").textContent = thousands_separators(response.data.finalTotal);//選取到總金額位置，並加入內容
            cartData = response.data.carts;
            console.log(cartData)
            cartData.forEach(item => {

                str += `<tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${thousands_separators(item.product.price)}</td>
                <td>${item.quantity}</td>
                <td>NT$${thousands_separators((item.product.price) * (item.quantity))}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" cart-id="${item.id}" data-product="${item.product.title}">
                        clear
                    </a>
                </td>
            </tr>`
            })

            shoppingCartList.innerHTML = str;
        })

}

//4.做購物車單一刪除功能
//4.1需要埋購物車id (不是產品ID唷)，找到相對應的位置<a>埋 cart-id="${item.id}" -->驗證點擊後用element查看，確認是否有把購物車id帶入
//4.2點刪除產品項目時，會出現警示並顯示那個產品被刪除了

shoppingCartList.addEventListener("click", (e) => {
    e.preventDefault();
    console.log(e.target)
    const cartId = e.target.getAttribute("cart-id");
    const dataProduct = e.target.getAttribute("data-product");//在HTML上加入data-product並取到想要的資料，目的：顯示刪除產品項目
    console.log(dataProduct)
    console.log(cartId);
    if (cartId == null) {
        return;
    }
    console.log(cartId);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
        .then((response) => {
            //console.log(response)
            alert(`刪除${dataProduct}成功`)//帶入顯示刪除產品項目
            getCartList() //記得渲染

        })
})
//刪除全部購物車流程
//5.1

const deleteAllBtn = document.querySelector(".discardAllBtn")
deleteAllBtn.addEventListener("click", (e) => {
    console.log(e)
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
        .then((response) => {
            alert("刪除所有品項")
            getCartList()

        })
        .catch((response) => {
            alert("購物車清空，請勿重複點擊")//.catch這時候必須要寫

        })

})

//6.表單驗證
//6.1前置作業：到HTML取消必填（資料要先送出去確認比較重要）,看欄位的值有沒有正確
//6.2送出資料綁監聽
//let orderData = []

const submitOrder = document.querySelector(".orderInfo-btn")
const orderForm = document.querySelector(".orderInfo-form")
const inputs = document.querySelectorAll("input[name],select[name]")

submitOrder.addEventListener("click", (e) => {
    e.preventDefault();
    if (cartData.length === 0) {
        alert("請加入購物車");
        return;

        // } else { //else 需要寫，雙重驗證
        //     alert("you have items in the cart");
    }
    // console.log("you have press")
    const isValidated = getIsValidated();
    if (!isValidated) {
        inputs.forEach((inputElement) => {
            handleInputValidate(inputElement);
        });
        alert("表單驗證失敗");
        return;

    } else {
        const orderName = document.querySelector("#customerName").value
        const orderPhone = document.querySelector("#customerPhone").value
        const orderEmail = document.querySelector("#customerEmail").value
        const orderAddress = document.querySelector("#customerAddress").value
        const orderTradeWay = document.querySelector("#tradeWay").value
        // console.log(orderName, orderPhone, orderEmail, orderAddress, orderTradeWay)
        // if (orderName == "" || orderPhone == "" || orderEmail == "" || orderAddress == "" || orderTradeWay == "") {
        //     alert("請輸入訂單訊息")
        //     return;
        // }

        axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
            "data": {
                "user": {
                    "name": orderName,
                    "tel": orderPhone,
                    "email": orderEmail,
                    "address": orderAddress,
                    "payment": orderTradeWay,

                }
            }
        }).then((response) => {
            alert("訂單成功");
            orderForm.reset();
            getCartList();
            renderProductList();//需要renderProductList這樣送出表單後會有購物項目

        })
    }
})

//若是中文，需要加""才可以帶到字，英文不需要“”
const constraints = {
    "姓名": {
        presence: {
            message: "必填欄位",
            allowEmpty: false,
        },
    },
    "電話": {
        format: {
            pattern: /^09[0-9]{8}$/,//https://seanacnet.com/js/input-regex/#%E9%9B%BB%E8%A9%B1%E9%A9%97%E8%AD%89
            message: "請輸入正確電話格式"
        },
    },
    "電子郵件": {
        format: {
            pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,//https://www.w3resource.com/javascript/form/email-validation.php
            message: "請輸入正確電子郵件格式"
        },

    },
    "寄送地址": {
        presence: {
            message: "必填欄位",
            allowEmpty: false,
        }
    },
    "交易方式": {
        presence: {
            message: "必填欄位",
            allowEmpty: false,
        }
    },
};

inputs.forEach((inputElement) => {
    console.log(inputElement)
    inputElement.addEventListener("change", () => {
        handleInputValidate(inputElement);
    })
})
function handleInputValidate(inputElement) {
    console.log(inputElement.name)
    console.log(inputElement.value)
    const inputName = inputElement.name;
    const inputValue = inputElement.value;
    console.log(inputValue)
    // 第一個參數 要驗證的內容
    const target = {
        [inputName]: inputValue,
    };
    console.log(target)
    // 第二個參數 驗證的規則
    const validateValue = {
        [inputName]: constraints[inputName],
    };
    console.log(validateValue)

    // 驗證通過， error 會是 undefined
    // 驗證失敗， error 會是 error message
    const error = validate(target, validateValue);
    console.log(error)
    const isError = !!error;//undefined->false,!error->true,!!error->false
    //驗證是if (undefined)=>是false(undefined 轉成布林是false)

    if (isError) {
        console.log(inputElement.nextElementSibling)
        // 塞入錯誤訊息
        inputElement.nextElementSibling.textContent = error[inputName];
        console.log(error[inputName])
    } else {
        // 清空錯誤訊息

        inputElement.nextElementSibling.textContent = "";
        console.log(inputElement.nextElementSibling.textContent)
    }
}

function getIsValidated() {
    const validateResult = validate(orderForm, constraints)
    return validateResult === undefined;
}
//util js (優化工具，也可以另外開去維護)

function thousands_separators(num) {
    let num_parts = num.toString().split("."); //(var為什麼要改成let?)
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
}


