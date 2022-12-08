
//前置作業console.log("hello")測試是否資料都有串接好/ admin.html需要載入config.js
//1.1admin得到資料，需要帶入第二個參數 headers: {"authorization": token,}
//1.2將資料做字串相加並顯示在table中
//1.3組產品ㄊ字串，讓他訂單品項可以顯示多筆產品和數量
//1.3.1可以針對畫面去調整HTML width%,讓品項欄位變寬,好閱讀
//1.4判斷訂單處理狀態，並可更改狀態
//1.5組訂單字串?
const orderList = document.querySelector(".orderList")
//console.log(orderList)
let orderData = [];
// function init() {
//     renderOrderList()
//     //renderC3()放在這裡是錯的，會有非同步問題
// }
function renderOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            "authorization": token,
        }
    })

        .then((response) => {
            console.log(response.data.orders)

            orderData = response.data.orders
            let str = ""
            orderData.forEach((item) => {
                //組時間字串
                const timeStamp = new Date(item.createdAt * 1000);//本身資料是寫秒，用new Date時，需要把它*1000變成毫秒，才可以使用new Date
                //console.log(timeStamp)
                const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`
                // console.log(orderTime)

                //組產品字串,要放這裡去抓item裡面的item.products
                let productStr = "";
                item.products.forEach((productItem) => {
                    productStr += `<p>${productItem.title}</P>x${productItem.quantity}`
                })
                //判斷訂單處理狀態
                let orderStatus = "";
                if (item.paid == true) { //Axios取回資料true,是boolean值，不能加雙引號，否則會跑到else 條件去
                    orderStatus = "已處理"
                } else {
                    orderStatus = "未處理"
                }

                //組訂單字串
                str += `<tr>
          <td>${item.id}</td>
          <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
          </td>
          <td>${item.user.address}</td>
          <td>${item.user.email}</td>
          <td>
              <p>${productStr}</p>
          </td>
          <td>${orderTime}</td>
          <td class="orderStatus ">
              <a href="#" data-status="${item.paid}" data-id="${item.id}" class="js-orderStatus">${orderStatus}</a>
          </td>
          <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除"  >
          </td> 
      </tr>`
                //綁data-id在button 上，讓它刪除時知道是哪個項目
            })
            orderList.innerHTML = str;
            renderC3_lv2();//要去思考何時要放上圖表並用函式叫出來，資料撈出來後放這是對的
        })


}


orderList.addEventListener("click", (e) => {
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    //console.log(targetClass);
    let id = e.target.getAttribute("data-id") //常用到的部分可以放到外層
    if (targetClass == "js-orderStatus") {
        //作法一：console.log(e.target.textContent)//抓到內容文字做處理狀態
        //作法二：在class="orderStaus" <a> 加入data-status="${item.paid}"取到值
        //console.log(e.target.getAttribute("data-status"))
        //帶入status,id 兩個參數，故要宣告這些參數
        //**data-id="${item.id}" 也需要放在a連結中，這樣才可以從if判斷是的限定裡找到
        let status = e.target.getAttribute("data-status");

        // console.log(status, id)
        changeOrderStatus(status, id)
        return //??why?
        //alert("您點到訂單狀態")
    }
    if (targetClass == "delSingleOrder-Btn js-orderDelete") {
        deleteOrderItem(id)
        return
    }
})

//帶入兩個參數
function changeOrderStatus(status, id) {
    console.log(status, id);
    let newStatus;
    if (status == "true") { //此true需要用字串來比對資料
        newStatus = false;
    }
    else {
        newStatus = true;
    }
    //axios.put(url[, data[, config]])
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            "data": {
                "id": id,
                "paid": newStatus
            }

        }, {
        headers: {
            "authorization": token,
        }

    })
        .then((response) => {
            alert("修改訂單狀態成功")
            renderOrderList()
        })
}
renderOrderList()//記得要把函式叫出來

function deleteOrderItem(id) {
    //console.log(id)
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`
        , {
            headers: {
                "authorization": token,
            }
        })
        .then((response) => {
            alert("刪除該訂單成功");
            renderOrderList();
        })
}

// function renderC3() {
//     console.log(orderData)
//     //物件資料搜集
//     let total = {};
//     orderData.forEach((item) => {
//         item.products.forEach((productItem) => {
//             console.log(productItem.category)
//             if (total[productItem.category] == undefined) {
//                 total[productItem.category] = productItem.price * productItem.quantity;
//             }
//             else {
//                 total[productItem.category] += productItem.price * productItem.quantity;
//             }
//         })

//     })

//     console.log(total)
//     //做出資料關聯
//     let categoryAry = Object.keys(total);
//     console.log(categoryAry)
//     let newData = [];
//     categoryAry.forEach((item) => {
//         let ary = [];
//         ary.push(item);
//         ary.push(total[item]);
//         newData.push(ary);
//     })
//     console.log(newData)
//     // C3.js
//     let chart = c3.generate({
//         bindto: '#chart', // HTML 元素綁定
//         data: {
//             type: "pie",
//             columns: newData,



//         },
//     });

// }
//renderC3_lv2 做產品名稱分類(8類，並排前3名)
function renderC3_lv2() {
    let obj = {};
    orderData.forEach((item) => {
        item.products.forEach((productItem) => {
            if (obj[productItem.title] === undefined) {
                obj[productItem.title] = productItem.quantity * productItem.price;
            } else {
                obj[productItem.title] += productItem.quantity * productItem.price
            }

            //拉出資料關聯（變成要的格式）

        })
    });
    let productAry = Object.keys(obj);
    //console.log(productAry);
    let rankSortAry = [];    //透過productArry整理成c3要的格式
    productAry.forEach((item) => {
        let ary = [];
        ary.push(item);//item丟入ary
        ary.push(obj[item]);//值丟入ary

        //console.log(item)
        //console.log(obj[item])
        rankSortAry.push(ary);//ary陣列資料push到rankSortAry
    })
    //console.log(obj)
    //console.log(rankSortAry)

    rankSortAry.sort((a, b) => {
        return b[1] - a[1];//陣列無法做比較，故要選取到第2筆資料[1]值,做排序
    })
    console.log(rankSortAry)
    //若比數大超過4筆以上，就統整為其他
    if (rankSortAry.length > 3) {//(0,1,2,3)3代表第4筆
        let otherTotal = 0;
        rankSortAry.forEach(function (item, index) {
            if (index > 2) {//(0,1,2)第三筆開始做以下加總
                otherTotal += rankSortAry[index][1];
            }
        })
        console.log(rankSortAry.length)
        rankSortAry.splice(3, rankSortAry.length - 1);//splice用法.splice(位置,刪除數<包含當下位置數>)
        //把第4筆後的資料全刪掉 ，疑問：實際帶資料(3,3)後面沒有三筆可以刪啊。？
        rankSortAry.push(["其他", otherTotal]);

    }

    c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: rankSortAry,
        },
        // colors: {
        //     pattern: ["#301E5F", "#5434A7", "#DACBFF", "#9D7FEA"]
        // }

    });
}

const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click", (e) => {
    //console.log(id)
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`
        , {
            headers: {
                "authorization": token,
            }
        })
        .then((response) => {
            alert("刪除全部訂單成功");
            renderOrderList();
        })
})

