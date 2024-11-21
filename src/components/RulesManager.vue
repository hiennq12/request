<template>
  <div>
    <div>rules: {{rules}}</div>
    <div>
      <label>Rule Type:</label>
      <select v-model="newRule.type">
        <option value="redirect">Redirect Request</option>
        <option value="modify">Modify Response</option>
      </select>

      <template v-if="newRule.type === 'redirect'">
        <label>From AAAAA:</label>
        <input v-model="newRule.from" placeholder="Source URL"/>
        <label>To BBBBB:</label>
        <input v-model="newRule.to" placeholder="Target URL"/>
      </template>

      <template v-if="newRule.type === 'modify'">
        <label>URL Pattern to Match:</label>
        <input
            v-model="newRule.from"
            placeholder="API URL pattern (e.g., https://api.example.com/data)"
        />

        <label>Modification Type:</label>
        <select v-model="newRule.modifyType">
          <option value="static">Static Response</option>
          <option value="dynamic">Modify Field</option>
        </select>

        <template v-if="newRule.modifyType === 'static'">
          <label>Static Response (JSON):</label>
          <textarea
              v-model="newRule.staticResponse"
              placeholder='{"data": "your static response"}'
              rows="4"
          ></textarea>
        </template>

        <template v-if="newRule.modifyType === 'dynamic'">
          <label>JSON Path to Modify:</label>
          <input
              v-model="newRule.fieldPath"
              placeholder="e.g., data.user.name"
          />
          <label>New Value:</label>
          <input
              v-model="newRule.newValue"
              placeholder="New value for the field"
          />
        </template>
      </template>

      <button @click="addRule">Add Rule</button>
    </div>

    <ul>
      <li v-for="(rule, index) in rules" :key="index">
        <div class="rule-header">
          <span class="rule-type">{{ rule.type === 'redirect' ? 'Redirect' : 'Modify' }}</span>
          <button @click="deleteRule(index)" class="delete-btn">Delete</button>
        </div>

        <div v-if="rule.type === 'redirect'" class="rule-content">
          From: {{ rule.from }}<br>
          To: {{ rule.to }}
        </div>

        <div v-else class="rule-content">
          URL Pattern: {{ rule.from }}<br>
          Type: {{ rule.modifyType }}<br>
          <template v-if="rule.modifyType === 'static'">
            Response: {{ truncateText(rule.staticResponse) }}
          </template>
          <template v-if="rule.modifyType === 'dynamic'">
            Field: {{ rule.fieldPath }}<br>
            New Value: {{ rule.newValue }}
          </template>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue';

export default {
  setup() {
    const newRule = reactive({
      type: 'redirect',
      from: '',
      to: '',
      modifyType: 'static',
      staticResponse: '',
      fieldPath: '',
      newValue: ''
    });

    const rules = reactive([]);

    const truncateText = (text, length = 50) => {
      return text?.length > length ? `${text.substring(0, length)}...` : text;
    };

    const loadRules = () => {
      chrome.storage.local.get(['rules'], (data) => {
        console.log('========: ', data)
        if (data.rules) {
          rules.splice(0, rules.length, ...data.rules);
        }
      });
    };

    const addRule = () => {
      // Validation
      if (newRule.type === 'redirect' && (!newRule.from || !newRule.to)) {
        alert('Please fill in both URL fields for redirect!');
        return;
      }

      if (newRule.type === 'modify') {
        if (!newRule.from) {
          alert('Please enter a URL pattern!');
          return;
        }
        if (newRule.modifyType === 'static' && !newRule.staticResponse) {
          alert('Please enter a static response!');
          return;
        }
        if (newRule.modifyType === 'dynamic' && (!newRule.fieldPath || !newRule.newValue)) {
          alert('Please enter both field path and new value!');
          return;
        }

        // Validate JSON for static response
        if (newRule.modifyType === 'static') {
          try {
            JSON.parse(newRule.staticResponse);
          } catch (e) {
            alert('Please enter valid JSON for static response!');
            return;
          }
        }
      }

      // Add rule
      rules.push({ ...newRule });
      updateStorage();

      // Reset form
      newRule.from = '';
      newRule.to = '';
      newRule.staticResponse = '';
      newRule.fieldPath = '';
      newRule.newValue = '';
    };

    const deleteRule = (index) => {
      rules.splice(index, 1);
      updateStorage();
    };

    const updateStorage = () => {
      chrome.storage.local.set({ rules: rules }, () => {
        console.log('Rules updated:', rules);
      });
    };

    onMounted(() => {
      loadRules();
      console.log('In mounted: ', this.rules);
    });

    return {
      newRule,
      rules,
      addRule,
      deleteRule,
      truncateText
    };
  }
};
</script>

<style scoped>
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, select, textarea {
  width: calc(100% - 20px);
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  font-family: monospace;
  resize: vertical;
  min-height: 80px;
}

button {
  margin: 5px 0;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

ul {
  list-style: none;
  padding: 0;
  margin-top: 20px;
}

li {
  border: 1px solid #ddd;
  margin: 10px 0;
  padding: 12px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rule-type {
  font-weight: bold;
  color: #2196F3;
}

.delete-btn {
  background-color: #f44336;
  padding: 4px 8px;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.rule-content {
  font-size: 0.9em;
  line-height: 1.4;
}
</style>





<!--<template>-->
<!--  <div>-->
<!--    <div>-->
<!--      <label>Rule Type:</label>-->
<!--      <select v-model="newRule.type">-->
<!--        <option value="redirect">Redirect Request</option>-->
<!--        <option value="modifyResponse">Modify Response</option>-->
<!--      </select>-->

<!--      &lt;!&ndash; Redirect Fields &ndash;&gt;-->
<!--      <template v-if="newRule.type === 'redirect'">-->
<!--        <label>From AAAAA:</label>-->
<!--        <input v-model="newRule.from" placeholder="Source URL"/>-->
<!--        <label>To BBBBB:</label>-->
<!--        <input v-model="newRule.to" placeholder="Target URL"/>-->
<!--      </template>-->

<!--      &lt;!&ndash; Response Modification Fields &ndash;&gt;-->
<!--      <template v-if="newRule.type === 'modifyResponse'">-->
<!--        <label>URL Pattern:</label>-->
<!--        <input v-model="newRule.from" placeholder="API URL Pattern"/>-->

<!--        <label>Modification Type:</label>-->
<!--        <select v-model="newRule.responseType">-->
<!--          <option value="static">Static Response</option>-->
<!--          <option value="modify">Modify Response</option>-->
<!--        </select>-->

<!--        <template v-if="newRule.responseType === 'static'">-->
<!--          <label>Static Response (JSON):</label>-->
<!--          <textarea-->
<!--              v-model="newRule.staticResponse"-->
<!--              placeholder='{"message": "Custom response"}'-->
<!--              rows="4"-->
<!--          ></textarea>-->
<!--        </template>-->

<!--        <template v-if="newRule.responseType === 'modify'">-->
<!--          <label>Modification Script:</label>-->
<!--          <textarea-->
<!--              v-model="newRule.modificationScript"-->
<!--              placeholder="Enter JavaScript to modify response"-->
<!--              rows="4"-->
<!--          ></textarea>-->
<!--        </template>-->
<!--      </template>-->

<!--      <button @click="addRule">Add Rule</button>-->
<!--    </div>-->

<!--    <ul>-->
<!--      <li v-for="(rule, index) in rules" :key="index">-->
<!--        <div v-if="rule.type === 'redirect'">-->
<!--          From Ahihi: {{ rule.from }} → To Ahaha: {{ rule.to }}-->
<!--        </div>-->
<!--        <div v-else>-->
<!--          Modify Response at: {{ rule.from }}-->
<!--          <br>-->
<!--          Type: {{ rule.responseType }}-->
<!--          <div v-if="rule.responseType === 'static'" class="response-preview">-->
<!--            Response: {{ rule.staticResponse.substring(0, 50) }}...-->
<!--          </div>-->
<!--          <div v-else class="response-preview">-->
<!--            Script: {{ rule.modificationScript.substring(0, 50) }}...-->
<!--          </div>-->
<!--        </div>-->
<!--        <button @click="deleteRule(index)">Delete</button>-->
<!--      </li>-->
<!--    </ul>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { reactive, onMounted } from 'vue';-->

<!--export default {-->
<!--  setup() {-->
<!--    const newRule = reactive({-->
<!--      type: 'redirect',-->
<!--      from: '',-->
<!--      to: '',-->
<!--      responseType: 'static',-->
<!--      staticResponse: '',-->
<!--      modificationScript: ''-->
<!--    });-->

<!--    const rules = reactive([]);-->

<!--    const loadRules = () => {-->
<!--      chrome.storage.local.get(['redirectRules', 'modifyRules'], (data) => {-->
<!--        const redirectRules = data.redirectRules || [];-->
<!--        const modifyRules = data.modifyRules || [];-->
<!--        rules.splice(0, rules.length, ...redirectRules, ...modifyRules);-->
<!--      });-->
<!--    };-->

<!--    const addRule = () => {-->
<!--      if (newRule.type === 'redirect' && (!newRule.from || !newRule.to)) {-->
<!--        alert('Please fill in both URL fields!');-->
<!--        return;-->
<!--      }-->
<!--      if (newRule.type === 'modifyResponse') {-->
<!--        if (!newRule.from) {-->
<!--          alert('Please enter URL pattern!');-->
<!--          return;-->
<!--        }-->
<!--        if (newRule.responseType === 'static' && !newRule.staticResponse) {-->
<!--          alert('Please enter static response!');-->
<!--          return;-->
<!--        }-->
<!--        if (newRule.responseType === 'modify' && !newRule.modificationScript) {-->
<!--          alert('Please enter modification script!');-->
<!--          return;-->
<!--        }-->
<!--      }-->

<!--      rules.push({ ...newRule });-->
<!--      updateStorage();-->
<!--      updateDeclarativeNetRequest();-->

<!--      // Reset form-->
<!--      newRule.from = '';-->
<!--      newRule.to = '';-->
<!--      newRule.staticResponse = '';-->
<!--      newRule.modificationScript = '';-->
<!--    };-->

<!--    const deleteRule = (index) => {-->
<!--      rules.splice(index, 1);-->
<!--      updateStorage();-->
<!--      updateDeclarativeNetRequest();-->
<!--    };-->

<!--    const updateStorage = () => {-->
<!--      const redirectRules = rules.filter(rule => rule.type === 'redirect');-->
<!--      const modifyRules = rules.filter(rule => rule.type === 'modifyResponse');-->

<!--      chrome.storage.local.set({-->
<!--        redirectRules,-->
<!--        modifyRules-->
<!--      }, () => {-->
<!--        console.log('Rules updated:', { redirectRules, modifyRules });-->
<!--      });-->
<!--    };-->

<!--    const updateDeclarativeNetRequest = () => {-->
<!--      const redirectRules = rules-->
<!--          .filter(rule => rule.type === 'redirect')-->
<!--          .map((rule, index) => ({-->
<!--            id: index + 1,-->
<!--            priority: 1,-->
<!--            action: {-->
<!--              type: 'redirect',-->
<!--              redirect: {-->
<!--                url: rule.to,-->
<!--              },-->
<!--            },-->
<!--            condition: {-->
<!--              urlFilter: rule.from,-->
<!--              resourceTypes: ['xmlhttprequest'],-->
<!--            },-->
<!--          }));-->

<!--      chrome.declarativeNetRequest.updateDynamicRules(-->
<!--          {-->
<!--            addRules: redirectRules,-->
<!--          },-->
<!--          () => {-->
<!--            console.log('Dynamic rules updated:', redirectRules);-->
<!--          }-->
<!--      );-->
<!--    };-->

<!--    onMounted(() => {-->
<!--      loadRules();-->
<!--    });-->

<!--    return {-->
<!--      newRule,-->
<!--      rules,-->
<!--      addRule,-->
<!--      deleteRule,-->
<!--    };-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--label {-->
<!--  display: block;-->
<!--  margin-bottom: 5px;-->
<!--}-->

<!--input, select, textarea {-->
<!--  width: calc(100% - 20px);-->
<!--  margin-bottom: 10px;-->
<!--  padding: 5px;-->
<!--}-->

<!--textarea {-->
<!--  font-family: monospace;-->
<!--  resize: vertical;-->
<!--}-->

<!--button {-->
<!--  margin: 5px 0;-->
<!--  padding: 5px;-->
<!--  background-color: #4caf50;-->
<!--  color: white;-->
<!--  border: none;-->
<!--  cursor: pointer;-->
<!--}-->

<!--button:hover {-->
<!--  background-color: #45a049;-->
<!--}-->

<!--.response-preview {-->
<!--  font-family: monospace;-->
<!--  font-size: 0.9em;-->
<!--  margin: 5px 0;-->
<!--  color: #666;-->
<!--}-->

<!--ul {-->
<!--  list-style: none;-->
<!--  padding: 0;-->
<!--}-->

<!--li {-->
<!--  border: 1px solid #ddd;-->
<!--  margin: 10px 0;-->
<!--  padding: 10px;-->
<!--  border-radius: 4px;-->
<!--}-->
<!--</style>-->







<!--<template>-->
<!--  <div>-->
<!--    <div>-->
<!--      <label>From AAAAA:</label>-->
<!--      <input v-model="newRule.from" placeholder="Source URL"/>-->
<!--      <label>To BBBBB:</label>-->
<!--      <input v-model="newRule.to" placeholder="Target URL"/>-->
<!--      <button @click="addRule">Add Rule</button>-->
<!--    </div>-->
<!--    <ul>-->
<!--      <li v-for="(rule, index) in rules" :key="index">-->
<!--        From Ahihi: {{ rule.from }} → To Ahaha: {{ rule.to }}-->
<!--        <button @click="deleteRule(index)">Delete</button>-->
<!--      </li>-->
<!--    </ul>-->
<!--  </div>-->



<!--</template>-->

<!--<script>-->
<!--import {reactive, onMounted} from 'vue';-->

<!--export default {-->
<!--  setup() {-->
<!--    const newRule = reactive({from: '', to: ''});-->
<!--    const rules = reactive([]);-->

<!--    console.log('+++DATA: ', chrome.storage.local)-->
<!--    // Hiển thị danh sách quy tắc từ chrome.storage-->
<!--    const loadRules = () => {-->
<!--      chrome.storage.local.get('redirectRules', (data) => {-->
<!--        rules.splice(0, rules.length, ...(data.redirectRules || []));-->
<!--      });-->
<!--    };-->

<!--    // Thêm quy tắc mới-->
<!--    const addRule = () => {-->
<!--      if (!newRule.from || !newRule.to) {-->
<!--        alert('Please fill in both fields!');-->
<!--        return;-->
<!--      }-->
<!--      console.log('Rules before add111: ', rules)-->
<!--      rules.push({...newRule});-->
<!--      console.log('Rules after add111: ', rules)-->
<!--      updateStorage();-->
<!--      updateDeclarativeNetRequest();-->
<!--      newRule.from = '';-->
<!--      newRule.to = '';-->
<!--    };-->

<!--    // Xóa quy tắc-->
<!--    const deleteRule = (index) => {-->
<!--      rules.splice(index, 1);-->
<!--      updateStorage();-->
<!--      updateDeclarativeNetRequest();-->
<!--    };-->

<!--    // Lưu quy tắc vào chrome.storage-->
<!--    const updateStorage = () => {-->
<!--      chrome.storage.local.set({redirectRules: rules}, () => {-->
<!--        console.log('Rules updated:', rules);-->
<!--      });-->
<!--    };-->

<!--    // Cập nhật dynamic rules của declarativeNetRequest-->
<!--    const updateDeclarativeNetRequest = () => {-->
<!--      const declarativeRules = rules.map((rule, index) => ({-->
<!--        id: index + 1,-->
<!--        priority: 1,-->
<!--        action: {-->
<!--          type: 'redirect',-->
<!--          redirect: {-->
<!--            url: rule.to,-->
<!--          },-->
<!--        },-->
<!--        condition: {-->
<!--          urlFilter: rule.from,-->
<!--          resourceTypes: ['xmlhttprequest'],-->
<!--        },-->
<!--      }));-->

<!--      chrome.declarativeNetRequest.updateDynamicRules(-->
<!--          {-->
<!--            // removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1), // Xóa tất cả quy tắc cũ-->
<!--            addRules: declarativeRules,-->
<!--          },-->
<!--          () => {-->
<!--            console.log('Dynamic rules updated:', declarativeRules);-->
<!--          }-->
<!--      );-->
<!--    };-->

<!--    // Gọi loadRules khi component được mounted-->
<!--    onMounted(() => {-->
<!--      loadRules();-->
<!--    });-->

<!--    return {-->
<!--      newRule,-->
<!--      rules,-->
<!--      addRule,-->
<!--      deleteRule,-->
<!--    };-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--label {-->
<!--  display: block;-->
<!--  margin-bottom: 5px;-->
<!--}-->

<!--input {-->
<!--  width: calc(100% - 20px);-->
<!--  margin-bottom: 10px;-->
<!--  padding: 5px;-->
<!--}-->

<!--button {-->
<!--  margin: 5px 0;-->
<!--  padding: 5px;-->
<!--  background-color: #4caf50;-->
<!--  color: white;-->
<!--  border: none;-->
<!--  cursor: pointer;-->
<!--}-->

<!--button:hover {-->
<!--  background-color: #45a049;-->
<!--}-->
<!--</style>-->
