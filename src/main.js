import './style.css'

const API_BASE = 'https://software-engineering-homework-backend.onrender.com'

document.querySelector('#app').innerHTML = `
  <div class="page-container">

    <header class="header">
      <h1>Web Calculator</h1>
      <p>Software Engineering Practice - Assignment 1</p>
    </header>

    <main class="main-content">

      <section class="calculator-card">

        <div class="display">
          <input
            id="expression"
            type="text"
            placeholder="请输入表达式"
            autocomplete="off"
          >

          <div id="result" class="result">0</div>
          <div id="error" class="error"></div>
        </div>

        <div class="buttons">

          <button class="btn btn-function" data-action="clear">
            AC
          </button>

          <button class="btn btn-function" data-action="backspace">
            ⌫
          </button>

          <button class="btn btn-operator" data-value="(">
            (
          </button>

          <button class="btn btn-operator" data-value=")">
            )
          </button>

          <button class="btn" data-value="7">7</button>
          <button class="btn" data-value="8">8</button>
          <button class="btn" data-value="9">9</button>

          <button class="btn btn-operator" data-value="/">
            ÷
          </button>

          <button class="btn" data-value="4">4</button>
          <button class="btn" data-value="5">5</button>
          <button class="btn" data-value="6">6</button>

          <button class="btn btn-operator" data-value="*">
            ×
          </button>

          <button class="btn" data-value="1">1</button>
          <button class="btn" data-value="2">2</button>
          <button class="btn" data-value="3">3</button>

          <button class="btn btn-operator" data-value="-">
            −
          </button>

          <button class="btn" data-value="0">0</button>
          <button class="btn" data-value=".">.</button>

          <button class="btn btn-equal" data-action="calculate">
            =
          </button>

          <button class="btn btn-operator" data-value="+">
            +
          </button>

        </div>

      </section>


      <section class="history-card">

        <div class="history-header">
          <div>
            <h2>计算历史</h2>
            <p>Calculation History</p>
          </div>

          <button id="refreshBtn" class="refresh-btn">
            刷新
          </button>
        </div>

        <div id="history">
          正在加载...
        </div>

      </section>

    </main>

    <footer>
      Software Engineering Practice
    </footer>

  </div>
`


const expressionInput =
  document.querySelector('#expression')

const resultElement =
  document.querySelector('#result')

const errorElement =
  document.querySelector('#error')

const historyElement =
  document.querySelector('#history')

const refreshBtn =
  document.querySelector('#refreshBtn')


function appendValue(value) {
  expressionInput.value += value
  expressionInput.focus()
}


function clearExpression() {
  expressionInput.value = ''
  resultElement.textContent = '0'
  errorElement.textContent = ''
}


function backspace() {
  expressionInput.value =
    expressionInput.value.slice(0, -1)

  expressionInput.focus()
}


async function calculate() {

  const expression =
    expressionInput.value.trim()

  errorElement.textContent = ''

  if (!expression) {
    errorElement.textContent =
      '请输入计算表达式'
    return
  }

  try {

    const response = await fetch(
      `${API_BASE}/api/calculate`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          expression: expression
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.detail || '计算失败'
      )
    }

    resultElement.textContent =
      data.result

    await loadHistory()

  } catch (error) {

    errorElement.textContent =
      error.message

  }
}


async function loadHistory() {

  try {

    const response = await fetch(
      `${API_BASE}/api/history`
    )

    if (!response.ok) {
      throw new Error()
    }

    const history =
      await response.json()

    if (history.length === 0) {

      historyElement.innerHTML = `
        <div class="empty-history">
          暂无计算记录
        </div>
      `

      return
    }

    historyElement.innerHTML =
      history.map(item => `
        <div class="history-item">

          <div class="history-info">

            <div class="history-expression">
              ${escapeHtml(item.expression)}
            </div>

            <div class="history-result">
              = ${escapeHtml(String(item.result))}
            </div>

            <div class="history-time">
              ${escapeHtml(item.created_at)}
            </div>

          </div>

          <div class="history-actions">

            <button
              class="reuse-btn"
              data-expression="${encodeURIComponent(
                item.expression
              )}"
            >
              再次使用
            </button>

            <button
              class="delete-btn"
              data-id="${item.id}"
            >
              删除
            </button>

          </div>

        </div>
      `).join('')


    document
      .querySelectorAll('.delete-btn')
      .forEach(button => {

        button.addEventListener(
          'click',
          async () => {

            await deleteHistory(
              button.dataset.id
            )

          }
        )

      })


    document
      .querySelectorAll('.reuse-btn')
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            expressionInput.value =
              decodeURIComponent(
                button.dataset.expression
              )

            expressionInput.focus()

          }
        )

      })

  } catch {

    historyElement.innerHTML = `
      <div class="empty-history">
        历史记录加载失败
      </div>
    `

  }

}


async function deleteHistory(id) {

  try {

    const response = await fetch(
      `${API_BASE}/api/history/${id}`,
      {
        method: 'DELETE'
      }
    )

    if (!response.ok) {
      throw new Error('删除失败')
    }

    await loadHistory()

  } catch (error) {

    alert(error.message)

  }

}


function escapeHtml(text) {

  const div =
    document.createElement('div')

  div.textContent = text

  return div.innerHTML

}


document
  .querySelectorAll('[data-value]')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        appendValue(
          button.dataset.value
        )

      }
    )

  })


document
  .querySelector(
    '[data-action="clear"]'
  )
  .addEventListener(
    'click',
    clearExpression
  )


document
  .querySelector(
    '[data-action="backspace"]'
  )
  .addEventListener(
    'click',
    backspace
  )


document
  .querySelector(
    '[data-action="calculate"]'
  )
  .addEventListener(
    'click',
    calculate
  )


refreshBtn.addEventListener(
  'click',
  loadHistory
)


expressionInput.addEventListener(
  'keydown',
  event => {

    if (event.key === 'Enter') {
      calculate()
    }

  }
)


loadHistory()
