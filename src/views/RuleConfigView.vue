<template>
  <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow-2xl rounded-2xl border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-10">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-extrabold">规则配置</h1>
        <router-link 
          to="/"
          class="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-md"
        >
          <span class="material-icons mr-3">arrow_back</span>
          返回首页
        </router-link>
      </div>

      <!-- Provider选择 -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">选择解析器</h2>
        <ProviderSelector
          :supported-providers="supportedProviders"
          :selected-provider="selectedProvider"
          @provider-selected="setProvider"
        />
      </div>

      <!-- 配置内容 -->
      <div v-if="selectedProvider && currentConfig" class="space-y-6">
        <!-- 配置头部 -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold">{{ currentConfig.name }}</h3>
            <p class="text-gray-600 dark:text-gray-300">{{ currentConfig.description }}</p>
          </div>
          <div class="flex gap-4">
            <button
              @click="showHistoryModal = true"
              class="inline-flex items-center px-8 py-4 text-lg font-bold bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 rounded-2xl shadow-lg transition-all duration-200"
            >
              <span class="material-icons mr-2">history</span>
              历史记录
            </button>
            <button
              @click="exportConfig"
              class="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-green-600 hover:bg-green-700 rounded-2xl shadow-lg transition-all duration-200"
            >
              <span class="material-icons mr-2">download</span>
              导出配置
            </button>
            <button
              @click="importConfig"
              class="inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg transition-all duration-200"
            >
              <span class="material-icons mr-2">upload</span>
              导入配置
            </button>
          </div>
        </div>

        <!-- 字段映射说明 -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 p-6">
          <div class="flex items-center mb-4">
            <span class="material-icons text-blue-600 dark:text-blue-400 mr-2">info</span>
            <h4 class="text-lg font-semibold text-blue-800 dark:text-blue-200">字段映射说明</h4>
          </div>
          <p class="text-blue-700 dark:text-blue-300 mb-4">
            以下是 {{ selectedProvider }} 解析器的字段映射关系，帮助您了解原始表格字段如何映射到规则匹配字段：
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="mapping in fieldMappings"
              :key="mapping.originalField"
              class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">原始字段</span>
                <span class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                  {{ mapping.mappedField }}
                </span>
              </div>
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {{ mapping.originalField }}
              </div>
              <div class="text-xs text-gray-600 dark:text-gray-400">
                {{ mapping.description }}
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <div class="flex items-start">
              <span class="material-icons text-yellow-600 dark:text-yellow-400 mr-2 text-sm mt-0.5">lightbulb</span>
              <div class="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>提示：</strong>在规则配置中，您可以使用映射后的字段名（如 peer、item、method 等）来设置匹配条件。
                例如：建设银行的"交易地点"字段会映射为"method"，您可以在规则中设置 method 匹配条件。
              </div>
            </div>
          </div>
        </div>

        <!-- 全局配置 -->
        <div class="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-xl font-bold">全局配置</h4>
            <div v-if="showAutoSaveMessage" class="text-sm text-gray-600 dark:text-gray-300 transition-opacity duration-300">
              <span class="material-icons mr-2 text-green-500">check_circle</span>
              配置已自动保存
            </div>
          </div>
          
          <!-- 配置信息 -->
          <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">配置名称</label>
                <input
                  v-model="currentConfig.name"
                  type="text"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="配置名称"
                  @input="autoSaveConfig"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">配置描述</label>
                <input
                  v-model="currentConfig.description"
                  type="text"
                  class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  placeholder="配置描述"
                  @input="autoSaveConfig"
                />
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认扣除账户(一般是资产账户)</label>
              <input
                v-model="currentConfig.defaultMinusAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Assets:FIXME"
                @input="autoSaveConfig"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认支出账户(一般是支出账户)</label>
              <input
                v-model="currentConfig.defaultPlusAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Expenses:FIXME"
                @input="autoSaveConfig"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认手续费扣除账户</label>
              <input
                v-model="currentConfig.defaultCommissionAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Expenses:Life:crypto:Commission:手续费"
                @input="autoSaveConfig"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认手续费支出账户</label>
              <input
                v-model="currentConfig.defaultPositionAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Assets:Crypto:ETH"
                @input="autoSaveConfig"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认货币</label>
              <input
                v-model="currentConfig.defaultCurrency"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="CNY"
                @input="autoSaveConfig"
              />
            </div>
            <!-- 以太坊API Key配置，仅ETH聚合链显示 -->
            <div v-if="selectedProvider === 'ethereum'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Etherscan API Key</label>
              <input
                v-model="ethereumApiKey"
                @blur="syncEthereumApiKey"
                @keyup.enter="syncEthereumApiKey"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="请输入Etherscan API Key"
              />
              <p class="text-xs text-gray-500 mt-1">用于提升以太坊及EVM链数据获取速率和稳定性，可在 <a href='https://etherscan.io/myapikey' target='_blank' class='underline text-blue-600'>Etherscan官网</a> 免费申请。</p>
            </div>
            <div v-if="currentConfig.defaultCashAccount">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认现金账户</label>
              <input
                v-model="currentConfig.defaultCashAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Assets:Cash"
                @input="autoSaveConfig"
              />
            </div>
            <div v-if="currentConfig.defaultPnlAccount">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认损益账户</label>
              <input
                v-model="currentConfig.defaultPnlAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Income:FIXME"
                @input="autoSaveConfig"
              />
            </div>
            <div v-if="currentConfig.defaultThirdPartyCustodyAccount">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">默认第三方托管账户</label>
              <input
                v-model="currentConfig.defaultThirdPartyCustodyAccount"
                type="text"
                class="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                placeholder="Assets:FIXME"
                @input="autoSaveConfig"
              />
            </div>
          </div>
        </div>

        <!-- 规则列表 -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-lg font-semibold">规则列表</h4>
            <div class="flex space-x-2">
              <button
                @click="addRule"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <span class="material-icons mr-2">add</span>
                添加规则
              </button>
              <button
                @click="debugRules"
                class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                <span class="material-icons mr-2">bug_report</span>
                调试规则
              </button>
            </div>
          </div>

          <!-- 筛选和搜索 -->
          <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">搜索规则</label>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索规则名称、描述、标签..."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">筛选类型</label>
                <select
                  v-model="filterType"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                >
                  <option value="">全部类型</option>
                  <option value="收入">收入</option>
                  <option value="支出">支出</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">排序方式</label>
                <div class="flex space-x-2">
                  <select
                    v-model="sortBy"
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="name">按名称</option>
                    <option value="created">按创建时间</option>
                  </select>
                  <button
                    @click="toggleSortOrder"
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                    :title="sortOrder === 'asc' ? '升序' : '降序'"
                  >
                    <span class="material-icons text-sm">{{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="rule in filteredAndSortedRules"
              :key="rule.id"
              class="relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <!-- 删除按钮 - 固定在右上角 -->
              <div class="absolute top-3 right-3 flex space-x-1 z-10">
                <button
                  @click="editRule(rule)"
                  class="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="编辑规则"
                >
                  <span class="material-icons text-lg">edit</span>
                </button>
                <button
                  @click="deleteRule(rule.id)"
                  class="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="删除规则"
                >
                  <span class="material-icons text-lg">delete</span>
                </button>
              </div>

              <!-- 规则内容 -->
              <div class="pr-16"> <!-- 为按钮留出空间 -->
                <!-- 规则标题 -->
                <div class="flex items-center space-x-2 mb-3">
                  <h5 class="font-semibold text-gray-900 dark:text-gray-100 text-lg">{{ rule.name }}</h5>
                  <span v-if="rule.ignore" class="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full font-semibold">忽略</span>
                </div>
                
                <!-- 规则描述 -->
                <p v-if="rule.description" class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ rule.description }}</p>
                
                <!-- 匹配条件 -->
                <div class="mb-4">
                  <h6 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">匹配条件</h6>
                  <div class="space-y-1.5">
                    <div v-if="rule.peer" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">交易对方:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-medium truncate">{{ rule.peer }}</span>
                    </div>
                    <div v-if="rule.item" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">商品说明:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-medium truncate">{{ rule.item }}</span>
                    </div>
                    <div v-if="rule.type" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">交易类型:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-medium">{{ rule.type }}</span>
                    </div>
                    <div v-if="rule.method" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">支付方式:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-medium truncate">{{ rule.method }}</span>
                    </div>
                    <div v-if="rule.category" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">交易分类:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-medium truncate">{{ rule.category }}</span>
                    </div>
                    <div v-if="rule.txType" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">交易类型:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-medium truncate">{{ rule.txType }}</span>
                    </div>
                    <div v-if="rule.time" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">时间范围:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-medium">{{ rule.time }}</span>
                    </div>
                    <div v-if="rule.minPrice || rule.maxPrice" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">金额范围:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-medium">
                        {{ rule.minPrice ? `${rule.minPrice}` : '0' }} - {{ rule.maxPrice ? `${rule.maxPrice}` : '∞' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 账户配置 -->
                <div class="mb-4">
                  <h6 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">账户配置</h6>
                  <div class="space-y-1.5">
                    <div v-if="rule.targetAccount" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">目标账户:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-mono text-xs truncate">{{ rule.targetAccount }}</span>
                    </div>
                    <div v-if="rule.methodAccount" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">方法账户:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-mono text-xs truncate">{{ rule.methodAccount }}</span>
                    </div>
                    <div v-if="rule.cashAccount" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">现金账户:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-mono text-xs truncate">{{ rule.cashAccount }}</span>
                    </div>
                    <div v-if="rule.positionAccount" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">持仓账户:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-mono text-xs truncate">{{ rule.positionAccount }}</span>
                    </div>
                    <div v-if="rule.commissionAccount" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">手续费账户:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-mono text-xs truncate">{{ rule.commissionAccount }}</span>
                    </div>
                    <div v-if="rule.pnlAccount" class="flex items-center text-sm">
                      <span class="text-gray-500 dark:text-gray-400 w-16 text-xs">损益账户:</span>
                      <span class="flex-1 text-gray-700 dark:text-gray-300 font-mono text-xs truncate">{{ rule.pnlAccount }}</span>
                    </div>
                  </div>
                </div>

                <!-- 匹配选项 -->
                <div v-if="rule.fullMatch || rule.ignore || rule.sep" class="mb-4">
                  <h6 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">匹配选项</h6>
                  <div class="flex flex-wrap gap-2">
                    <span v-if="rule.fullMatch" class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-semibold">
                      <span class="material-icons text-xs mr-1">check_circle</span>
                      精确匹配
                    </span>
                    <span v-if="rule.ignore" class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-xs font-semibold">
                      <span class="material-icons text-xs mr-1">block</span>
                      忽略交易
                    </span>
                    <span v-if="rule.sep" class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-semibold">
                      <span class="material-icons text-xs mr-1">list</span>
                      分隔符: {{ rule.sep }}
                    </span>
                  </div>
                </div>

                <!-- 标签 -->
                <div v-if="rule.tags && rule.tags.length > 0">
                  <h6 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">标签</h6>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="tag in rule.tags"
                      :key="tag"
                      class="inline-block bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs font-semibold"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无规则提示 -->
          <div v-if="filteredAndSortedRules.length === 0" class="text-center py-8">
            <span class="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-4">rule</span>
            <p class="text-gray-600 dark:text-gray-300">
              {{ searchQuery || filterType ? '没有找到匹配的规则' : '还没有配置规则' }}
            </p>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end pt-8 border-t border-gray-200 dark:border-gray-700">
          <!-- 删除原来的自动保存提示 -->
        </div>
      </div>

      <!-- 未选择Provider的提示 -->
      <div v-else-if="!selectedProvider" class="text-center py-12">
        <i class="material-icons text-4xl text-gray-400 dark:text-gray-500 mb-4">storage</i>
        <p class="text-gray-600 dark:text-gray-300">请先选择一个解析器来配置规则</p>
      </div>

      <!-- 无配置的提示 -->
      <div v-else-if="!currentConfig" class="text-center py-12">
        <i class="material-icons text-4xl text-yellow-400 mb-4">warning</i>
        <p class="text-gray-600 dark:text-gray-300 mb-4">该解析器还没有配置，是否从预设配置创建？</p>
        <button
          @click="createFromPreset"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <span class="material-icons mr-2">add</span>
          从预设创建配置
        </button>
      </div>
    </div>

    <!-- 规则编辑器模态框 -->
    <div v-if="showRuleEditor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <RuleEditor
          :rule="editingRule"
          :is-editing="!!editingRule"
          @save="saveRule"
          @close="closeRuleEditor"
        />
      </div>
    </div>

    <!-- 历史记录模态框 -->
    <div v-if="showHistoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold">历史记录</h3>
          <button
            @click="showHistoryModal = false"
            class="text-gray-400 hover:text-gray-600 dark:text-gray-500 text-2xl"
          >
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="history in providerHistory"
            :key="history.id"
            class="border-2 border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer font-semibold"
            @click="applyHistory(history.id)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">{{ history.name }}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ formatDate(history.createdAt) }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg text-base hover:bg-blue-700 font-semibold"
                >
                  应用
                </button>
                <button
                  @click.stop="deleteHistory(history.id)"
                  class="px-4 py-2 bg-red-600 text-white rounded-lg text-base hover:bg-red-700 font-semibold"
                  title="删除历史记录"
                >
                  <span class="material-icons text-sm">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="providerHistory.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          暂无历史记录
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ProviderType } from '../types/provider';
import type { RuleConfig, Rule, ConfigHistory } from '../types/rule-config';
import { providers, getProviderFieldMappings } from '../data/providers';
import { ruleConfigService } from '../services/rule-config-service';
import ProviderSelector from '../components/ProviderSelector.vue';
import RuleEditor from '../components/RuleEditor.vue';

const route = useRoute();
const router = useRouter();

// 响应式数据
const selectedProvider = ref<ProviderType | null>(null);
const currentConfig = ref<RuleConfig | null>(null);
const showRuleEditor = ref(false);
const editingRule = ref<Rule | undefined>(undefined);
const showHistoryModal = ref(false);
const searchQuery = ref('');
const filterType = ref('');
const sortBy = ref('');
const showConfigEditor = ref(false);
const sortOrder = ref<'asc' | 'desc'>('asc');
const showAutoSaveMessage = ref(false);

// API配置响应式数据
const apiConfig = ref({
  ethereum: { apiKey: '', rpcUrl: '' },
  bsc: { apiKey: '', rpcUrl: '' },
  polygon: { apiKey: '', rpcUrl: '' },
  arbitrum: { apiKey: '', rpcUrl: '' },
  optimism: { apiKey: '', rpcUrl: '' },
  avalanche: { apiKey: '', rpcUrl: '' },
  solana: { apiKey: '', rpcUrl: '' },
  bitcoin: { apiKey: '', rpcUrl: '' },
  ethscan: { apiKey: '' },
  tronscan: { apiKey: '' }
});

// 新增本地变量用于ETH API Key输入
const ethereumApiKey = ref('');

watch([currentConfig, selectedProvider], () => {
  if (selectedProvider.value === 'ethereum' && currentConfig.value && currentConfig.value.apiConfig && currentConfig.value.apiConfig.ethereum) {
    ethereumApiKey.value = currentConfig.value.apiConfig.ethereum.apiKey || '';
  }
}, { immediate: true });

function syncEthereumApiKey() {
  if (selectedProvider.value === 'ethereum' && currentConfig.value && currentConfig.value.apiConfig && currentConfig.value.apiConfig.ethereum) {
    currentConfig.value.apiConfig.ethereum.apiKey = ethereumApiKey.value;
    autoSaveConfig();
  }
}

// 计算属性
const supportedProviders = computed(() => providers);

const fieldMappings = computed(() => {
  if (!selectedProvider.value) return [];
  return getProviderFieldMappings(selectedProvider.value);
});

const sortedRules = computed(() => {
  if (!currentConfig.value) return [];
  return [...currentConfig.value.rules];
});

const providerHistory = computed(() => {
  if (!selectedProvider.value) return [];
  return ruleConfigService.getHistory(selectedProvider.value);
});

const filteredAndSortedRules = computed(() => {
  let rules = sortedRules.value.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         (rule.tags && rule.tags.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase())));
    const matchesType = filterType.value === '' || (rule.type === filterType.value);
    return matchesSearch && matchesType;
  });

  // 排序
  if (sortBy.value === 'name') {
    rules = rules.sort((a, b) => {
      const result = a.name.localeCompare(b.name);
      return sortOrder.value === 'asc' ? result : -result;
    });
  } else if (sortBy.value === 'created') {
    rules = rules.sort((a, b) => {
      const result = (a.id || '').localeCompare(b.id || '');
      return sortOrder.value === 'asc' ? result : -result;
    });
  }

  return rules;
});

// 方法
const setProvider = (provider: ProviderType) => {
  selectedProvider.value = provider;
};

const loadConfig = () => {
  if (!selectedProvider.value) return;
  const config = ruleConfigService.getConfig(selectedProvider.value);
  if (config) {
    if (!config.apiConfig) config.apiConfig = { ethereum: { apiKey: '' } };
    if (!config.apiConfig.ethereum) config.apiConfig.ethereum = { apiKey: '' };
  }
  currentConfig.value = config;
  // 加载API配置
  if (config?.apiConfig) {
    apiConfig.value = {
      ethereum: { apiKey: config.apiConfig.ethereum?.apiKey || '', rpcUrl: config.apiConfig.ethereum?.rpcUrl || '' },
      bsc: { apiKey: config.apiConfig.bsc?.apiKey || '', rpcUrl: config.apiConfig.bsc?.rpcUrl || '' },
      polygon: { apiKey: config.apiConfig.polygon?.apiKey || '', rpcUrl: config.apiConfig.polygon?.rpcUrl || '' },
      arbitrum: { apiKey: config.apiConfig.arbitrum?.apiKey || '', rpcUrl: config.apiConfig.arbitrum?.rpcUrl || '' },
      optimism: { apiKey: config.apiConfig.optimism?.apiKey || '', rpcUrl: config.apiConfig.optimism?.rpcUrl || '' },
      avalanche: { apiKey: config.apiConfig.avalanche?.apiKey || '', rpcUrl: config.apiConfig.avalanche?.rpcUrl || '' },
      solana: { apiKey: config.apiConfig.solana?.apiKey || '', rpcUrl: config.apiConfig.solana?.rpcUrl || '' },
      bitcoin: { apiKey: config.apiConfig.bitcoin?.apiKey || '', rpcUrl: config.apiConfig.bitcoin?.rpcUrl || '' },
      ethscan: { apiKey: config.apiConfig.ethscan?.apiKey || '' },
      tronscan: { apiKey: config.apiConfig.tronscan?.apiKey || '' }
    };
  }
};

// 从URL参数初始化Provider
const initFromRoute = () => {
  const providerParam = route.query.provider as string;
  if (providerParam && Object.values(ProviderType).includes(providerParam as ProviderType)) {
    selectedProvider.value = providerParam as ProviderType;
    loadConfig();
  }
};

const createFromPreset = async () => {
  if (!selectedProvider.value) return;
  
  try {
    const config = await ruleConfigService.createFromPreset(selectedProvider.value, '我的配置');
    currentConfig.value = config;
    ruleConfigService.saveConfig(config);
  } catch (error) {
    console.error('Failed to create from preset:', error);
    alert('创建配置失败');
  }
};

const saveConfig = () => {
  if (!currentConfig.value) return;
  
  ruleConfigService.saveConfig(currentConfig.value);
  alert('配置保存成功！');
};

const addRule = () => {
  editingRule.value = undefined;
  showRuleEditor.value = true;
};

const editRule = (rule: Rule) => {
  editingRule.value = rule;
  showRuleEditor.value = true;
};

const saveRule = (rule: Rule) => {
  if (!currentConfig.value) return;
  
  // 确保规则有id
  if (!rule.id) {
    rule.id = Date.now().toString();
  }
  
  const existingIndex = currentConfig.value.rules.findIndex(r => r.id === rule.id);
  
  if (existingIndex >= 0) {
    // 更新现有规则
    currentConfig.value.rules[existingIndex] = rule;
  } else {
    // 添加新规则
    currentConfig.value.rules.push(rule);
  }
  
  // 自动保存配置
  ruleConfigService.saveConfig(currentConfig.value);
  
  // 显示成功提示
  alert('规则保存成功！');
  
  closeRuleEditor();
};

const deleteRule = (ruleId: string | undefined) => {
  if (!currentConfig.value || !ruleId) return;
  
  if (confirm('确定要删除这个规则吗？')) {
    currentConfig.value.rules = currentConfig.value.rules.filter(r => r.id !== ruleId);
    // 自动保存配置
    ruleConfigService.saveConfig(currentConfig.value);
  }
};

const closeRuleEditor = () => {
  showRuleEditor.value = false;
  editingRule.value = undefined;
};

const exportConfig = async () => {
  if (!selectedProvider.value) return;
  
  const success = await ruleConfigService.exportToClipboard(selectedProvider.value);
  if (success) {
    alert('配置已复制到剪贴板！');
  } else {
    alert('导出失败，请重试');
  }
};

const importConfig = async () => {
  const config = await ruleConfigService.importFromClipboard();
  if (config) {
    currentConfig.value = config;
    alert('配置导入成功！');
  } else {
    alert('导入失败，请检查剪贴板内容格式');
  }
};

const applyHistory = (historyId: string) => {
  const config = ruleConfigService.applyHistory(historyId);
  if (config) {
    currentConfig.value = config;
    showHistoryModal.value = false;
    alert('历史配置应用成功！');
  } else {
    alert('应用历史配置失败');
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

const debugRules = () => {
  if (selectedProvider.value) {
    router.push({ 
      path: '/bill-processing', 
      query: { 
        provider: selectedProvider.value,
        from: 'rule-config'
      } 
    });
  } else {
    router.push({ 
      path: '/bill-processing',
      query: { from: 'rule-config' }
    });
  }
};

const deleteHistory = (historyId: string) => {
  if (confirm('确定要删除这个历史记录吗？')) {
    const success = ruleConfigService.deleteHistory(historyId);
    if (success) {
      // 重新加载历史记录
      showHistoryModal.value = false;
      alert('历史记录删除成功！');
    } else {
      alert('删除失败，请重试');
    }
  }
};

const autoSaveConfig = () => {
  if (!currentConfig.value) return;
  // 确保apiConfig存在
  if (!currentConfig.value.apiConfig) {
    currentConfig.value.apiConfig = { ethereum: { apiKey: '' } };
  }
  if (!currentConfig.value.apiConfig.ethereum) {
    currentConfig.value.apiConfig.ethereum = { apiKey: '' };
  }
  // 触发响应式
  currentConfig.value = { ...currentConfig.value };
  ruleConfigService.saveConfig(currentConfig.value);
  // 显示自动保存提示
  showAutoSaveMessage.value = true;
  setTimeout(() => {
    showAutoSaveMessage.value = false;
  }, 2000);
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

// 监听Provider变化
watch(selectedProvider, () => {
  loadConfig();
});

// 组件挂载时初始化
onMounted(() => {
  initFromRoute();
});
</script> 