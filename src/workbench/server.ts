import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { getFormulaDefinitionsForClient, runCalculation } from './calculators.ts';

const port = Number(process.env.PORT ?? 4173);

const server = createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/') {
      sendHtml(response, pageHtml);
      return;
    }

    if (request.method === 'GET' && request.url === '/client.js') {
      send(response, 200, clientJs, 'application/javascript; charset=utf-8');
      return;
    }

    if (request.method === 'GET' && request.url === '/api/formulas') {
      sendJson(response, 200, { formulas: getFormulaDefinitionsForClient() });
      return;
    }

    if (request.method === 'POST' && request.url === '/api/calculate') {
      const body = await readJson(request);
      const id = typeof body.id === 'string' ? body.id : '';
      const input = isRecord(body.input) ? body.input : {};
      const outputs = runCalculation(id, input);

      sendJson(response, 200, { outputs });
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Formula workbench running at http://127.0.0.1:${port}`);
});

function sendHtml(response: ServerResponse, html: string): void {
  send(response, 200, html, 'text/html; charset=utf-8');
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  send(response, statusCode, JSON.stringify(body), 'application/json; charset=utf-8');
}

function send(response: ServerResponse, statusCode: number, body: string, contentType: string): void {
  response.writeHead(statusCode, {
    'content-type': contentType,
    'cache-control': 'no-store',
  });
  response.end(body);
}

function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let data = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      data += chunk;
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}') as Record<string, unknown>);
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const pageHtml = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Simply Property Formula Workbench</title>
    <style>
      :root {
        color-scheme: light;
        --page: #f5f7fa;
        --surface: #ffffff;
        --surface-soft: #eef2f6;
        --line: #d6dde5;
        --text: #17212b;
        --muted: #617080;
        --primary: #0b6f6a;
        --primary-strong: #07544f;
        --accent: #155eef;
        --answer-bg: #fff6cc;
        --answer-line: #c48a00;
        --danger: #a91515;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--page);
        color: var(--text);
        font-family: Arial, Helvetica, sans-serif;
        font-size: 15px;
        line-height: 1.4;
      }

      header {
        background: var(--surface);
        border-bottom: 1px solid var(--line);
        padding: 18px 24px;
      }

      h1 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
      }

      main {
        display: grid;
        grid-template-columns: 320px minmax(0, 1fr);
        gap: 20px;
        padding: 20px 24px 28px;
      }

      label {
        display: block;
        font-weight: 700;
      }

      select,
      input,
      button {
        font: inherit;
      }

      select,
      input {
        width: 100%;
        min-height: 38px;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #fff;
        color: var(--text);
        padding: 8px 10px;
      }

      button {
        min-height: 40px;
        border: 1px solid var(--primary);
        border-radius: 6px;
        background: var(--primary);
        color: #fff;
        cursor: pointer;
        font-weight: 700;
        padding: 8px 14px;
      }

      button:hover {
        background: var(--primary-strong);
      }

      .panel {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 8px;
      }

      .panel-header {
        border-bottom: 1px solid var(--line);
        padding: 14px 16px;
      }

      .panel-title {
        margin: 0;
        font-size: 16px;
      }

      .panel-body {
        padding: 16px;
      }

      .stack {
        display: grid;
        gap: 12px;
      }

      .meta {
        color: var(--muted);
        font-size: 13px;
        margin-top: 4px;
      }

      .formula-description {
        color: var(--muted);
        margin: 0;
      }

      .formula-confidence {
        display: inline-block;
        margin-top: 8px;
        color: var(--primary-strong);
        font-size: 13px;
        font-weight: 700;
      }

      .table-wrap {
        overflow-x: auto;
        border: 1px solid var(--line);
        border-radius: 8px;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        min-width: 760px;
        background: var(--surface);
      }

      th,
      td {
        border-bottom: 1px solid var(--line);
        padding: 10px 12px;
        text-align: left;
        vertical-align: middle;
      }

      th {
        background: var(--surface-soft);
        font-size: 13px;
        color: var(--muted);
        text-transform: uppercase;
      }

      tr:last-child td {
        border-bottom: 0;
      }

      .field-note {
        color: var(--muted);
        font-size: 12px;
      }

      .outputs {
        margin-top: 16px;
      }

      .answer {
        background: var(--answer-bg);
        border-left: 4px solid var(--answer-line);
        font-weight: 800;
        text-decoration: underline;
      }

      .error {
        color: var(--danger);
        font-weight: 700;
      }

      @media (max-width: 840px) {
        main {
          grid-template-columns: 1fr;
          padding: 14px;
        }

        header {
          padding: 16px 14px;
        }
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Simply Property Formula Workbench</h1>
    </header>

    <main>
      <aside class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Formula</h2>
        </div>
        <div class="panel-body stack">
          <label for="formulaSelect">Select Function</label>
          <select id="formulaSelect"></select>
          <div>
            <p id="formulaDescription" class="formula-description"></p>
            <span id="formulaConfidence" class="formula-confidence"></span>
          </div>
          <button id="runButton" type="button">Run Calculation</button>
          <div id="error" class="error" role="alert"></div>
        </div>
      </aside>

      <section class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Inputs And Output</h2>
          <div class="meta">Inputs are shown as rows. Calculated answers appear at the end in bold and underlined cells.</div>
        </div>
        <div class="panel-body">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Input</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody id="inputRows"></tbody>
            </table>
          </div>

          <div class="outputs table-wrap" id="outputWrap" hidden>
            <table>
              <thead>
                <tr>
                  <th>Output</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody id="outputRows"></tbody>
            </table>
          </div>
        </div>
      </section>
    </main>

    <script src="/client.js"></script>
  </body>
</html>`;

const clientJs = String.raw`const state = {
  formulas: [],
  selectedFormula: null,
};

const formulaSelect = document.querySelector('#formulaSelect');
const formulaDescription = document.querySelector('#formulaDescription');
const formulaConfidence = document.querySelector('#formulaConfidence');
const inputRows = document.querySelector('#inputRows');
const outputRows = document.querySelector('#outputRows');
const outputWrap = document.querySelector('#outputWrap');
const runButton = document.querySelector('#runButton');
const errorBox = document.querySelector('#error');

async function init() {
  const response = await fetch('/api/formulas');
  const data = await response.json();
  state.formulas = data.formulas;

  for (const formula of state.formulas) {
    const option = document.createElement('option');
    option.value = formula.id;
    option.textContent = formula.group + ' - ' + formula.name;
    formulaSelect.append(option);
  }

  formulaSelect.addEventListener('change', selectFormula);
  runButton.addEventListener('click', runSelectedFormula);
  selectFormula();
  await runSelectedFormula();
}

function selectFormula() {
  state.selectedFormula = state.formulas.find((formula) => formula.id === formulaSelect.value) || state.formulas[0];
  formulaDescription.textContent = state.selectedFormula.description;
  formulaConfidence.textContent = state.selectedFormula.confidence;
  outputWrap.hidden = true;
  outputRows.replaceChildren();
  errorBox.textContent = '';
  renderInputs();
}

function renderInputs() {
  inputRows.replaceChildren();

  for (const field of state.selectedFormula.fields) {
    const row = document.createElement('tr');

    const labelCell = document.createElement('td');
    labelCell.textContent = field.label;

    const typeCell = document.createElement('td');
    typeCell.textContent = field.type;

    const valueCell = document.createElement('td');
    valueCell.append(createInput(field));

    const noteCell = document.createElement('td');
    noteCell.className = 'field-note';
    noteCell.textContent = field.note || '';

    row.append(labelCell, typeCell, valueCell, noteCell);
    inputRows.append(row);
  }
}

function createInput(field) {
  if (field.type === 'select') {
    const select = document.createElement('select');
    select.id = field.id;

    for (const item of field.options || []) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      select.append(option);
    }

    select.value = String(field.defaultValue);
    return select;
  }

  if (field.type === 'boolean') {
    const select = document.createElement('select');
    select.id = field.id;

    for (const item of [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ]) {
      const option = document.createElement('option');
      option.value = item.value;
      option.textContent = item.label;
      select.append(option);
    }

    select.value = String(field.defaultValue);
    return select;
  }

  const input = document.createElement('input');
  input.id = field.id;
  input.value = String(field.defaultValue);

  if (field.type === 'date') {
    input.type = 'date';
  } else {
    input.type = 'text';
    input.inputMode = 'decimal';
  }

  return input;
}

async function runSelectedFormula() {
  errorBox.textContent = '';
  outputRows.replaceChildren();

  try {
    const input = {};

    for (const field of state.selectedFormula.fields) {
      const control = document.getElementById(field.id);
      input[field.id] = control.value;
    }

    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: state.selectedFormula.id,
        input,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Calculation failed');
    }

    renderOutputs(data.outputs);
  } catch (error) {
    outputWrap.hidden = true;
    errorBox.textContent = error instanceof Error ? error.message : String(error);
  }
}

function renderOutputs(outputs) {
  outputRows.replaceChildren();

  for (const output of outputs) {
    const row = document.createElement('tr');

    if (output.isAnswer) {
      row.className = 'answer';
    }

    const labelCell = document.createElement('td');
    labelCell.textContent = output.isAnswer ? 'Answer: ' + output.label : output.label;

    const valueCell = document.createElement('td');
    valueCell.textContent = output.value;

    row.append(labelCell, valueCell);
    outputRows.append(row);
  }

  outputWrap.hidden = false;
}

init().catch((error) => {
  errorBox.textContent = error instanceof Error ? error.message : String(error);
});`;
