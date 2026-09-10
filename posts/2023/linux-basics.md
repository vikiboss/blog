---
title: '每一个前端都应该了解的常见 Linux 命令'
date: 2023-02-14
topic: '技术'
excerpt: '前端开发必知必会的 Linux 命令大全。'
archived: true
tags:
  - 'Linux'
  - '命令行'
  - '前端'
  - '运维'
  - '教程'
---

~~都情人节了（今天 2/14），让我看看是谁还赖在电脑前啊？哦，原来是我，那没事了（~~

学习一些常用的 Linux 命令有助于提高我们的工作效率。哪怕是作为一个前端，也应该有所了解。

> 另外，由于 macOS 是基于 Unix 的，以下列出的命令在 macOS 上也能正常使用。

## 一、基础篇

### 1. cd

全称 change directory，意为切换目录，用于切换当前工作目录。

```bash
# 切换到用户主目录，如 /root 或 /home/viki 等
cd ~  # 或者不带任何参数 cd

# 可使用绝对路径或相对路径
cd ./src

# 切换到上一个工作目录
cd -

# 切换到父目录
cd ..
```

### 2. ls

全称 list，意为罗列，用于列出当前工作目录下的文件和子目录。

```bash
# 查看当前工作路径下的文件和子目录
ls

# 包括隐藏文件（-a），并列出详细信息（-l）
ls -al

# 按文件大小排序（-S），-t 按时间排序，-X 按扩展名字母升序
ls -alS
```

### 3. rm

全称 remove，意为删除，用于删除文件或目录。

```bash
# 安全删除一个或多个文件或目录（带有提示）
rm -ri temp1 temp2 temp3

# 强制删除一个或多个文件或目录，慎用
rm -rf temp1 temp2 temp3

# 通过 glob 模式匹配删除多个指定文件，可用 ls 命令事先确认
rm *.txt
rm *.{png,jp{,e}g}
rm src/**/*.d.ts
```

> 关于 glob 模式匹配，参考 [这篇文章](https://github.com/whinc/whinc.github.io/issues/18)。

### 4. cp

全称 copy，意为复制，用于复制文件或目录。

```bash
# 拷贝文件
cp file1.txt file2.txt

# 拷贝目录（-r 意为递归）
cp -r temp temp2
```

### 5. mv

全称 move，意为移动，常用于移动或重命名文件或目录。

```bash
# 移动文件，将所有 jpg 文件移动到 images 目录
mv *.jpg images

# 重命名文件
mv file1.txt file2.txt
```

### 6. mkdir

全称 make directory，新建目录。

```bash
# 创建目录
mkdir temp

# 创建多个目录
mkdir temp temp2 temp3

# 递归创建（当中间的目录路径不存在时不会报错，会自动创建）
mkdir -p temp/src/images
```

### 7. cat

全称 concatenate，意为连接，它可以读取、创建和合并文件，并将其内容写入到标准输出。

```bash
# 查看文件内容，-n 显示行号，-s 合并空行，如下输出当前的 Linux 发行版名称
cat -ns /etc/issue

# 创建文件，执行完命令后继续输入文件内容，Ctrl/Command + D 保存
cat > file.txt

# 重定向文件内容
cat file1.txt > file2.txt   # 文件存在则覆盖
cat file1.txt >> file2.txt  # 文件存在则追加

# 合并文件
cat demo1.txt demo2.txt > demo.txt
```

### 8. touch

意为触摸，用于修改文件或目录的时间属性，包括存取时间和更改时间。

若文件不存在，系统会建立一个新的文件，所以**常常被用于新建空文件**。

```bash
# 将目标文件的访问和修改时间改为当前时间，不存在则新建空文件
touch demo.txt

# 一次性创建多个空文件
touch file1.txt file2.txt file3.txt
```

### 9. pwd

全称 print working directory，意为打印当前工作目录。

```bash
# 显示当前所在的完整路径
pwd
```

### 10. sudo

全称 superuser do，意为使用超级用户执行（某些命令）。

```bash
# 以超级用户权限执行 apt 命令
sudo apt update

# 执行上一条命令（忘记加 sudo 时非常有用）
sudo !!
```

### 11. whoami

who am i，意为我是谁，查看当前用户的用户名。

```bash
# 查看当前登录的用户名
whoami
```

### 12. clear

意为清除，清空终端输出。快捷键 `Ctrl + L` 也可以达到同样效果。

### 13. uptime

意为正常运行时间，显示系统已运行了多长时间、当前时间、已登录的用户数以及系统平均负载。

```bash
# 查看完整信息
uptime

# 系统启动时长
uptime -p

# 系统启动时间
uptime -s
```

### 14. passwd

全称 password，意为密码，此命令用于修改用户密码。

```bash
# 更改当前用户密码
passwd

# 使用超级用户权限更改其他用户密码
sudo passwd viki
```

### 15. date

意为日期，格式化查看、设置系统当前日期时间，**查看、转换时间戳**等。

```bash
# 查看系统当前时间
date

# 格式化输出系统时间
date +"%Y/%m/%d %H:%M:%S %A"

# 设置系统当前时间（需要 root 权限）
sudo date --set="20190601 17:30"

# 查看当前时间戳（10 位秒级）
date +%s

# 转换目标时间戳（10 位秒级）
date -d @1676382887
```

**附：同步互联网时间的命令**

```bash
# 安装 ntpdate
sudo apt-get install ntpdate

# 执行时间同步
sudo ntpdate time.windows.com
sudo hwclock --localtime --systohc
```

### 16. top

提供实时的系统处理器状态监视，能够实时显示系统中各个进程的资源占用状况，类似于 Windows 的任务管理器。

top 是一个动态显示过程，可以通过用户按键来不断刷新当前状态。

```bash
# 启动 top 监视器
top

# 按 q 退出
# 按 M 按内存排序
# 按 P 按 CPU 排序
```

### 17. history

意为历史，用于显示带有行号的整个历史记录列表。

```bash
# 查看所有历史命令
history

# 查看最近 20 条历史
history 20

# 获取上一条命令
!!

# 当执行某一大串命令时忘记加 sudo 时非常有用
sudo !!

# 搜索历史命令（Ctrl + R）
# 输入关键词即可搜索
```

### 18. man

全称 manual，意为手册，用于查看命令帮助文档。

```bash
# 查看 curl 的命令帮助
man curl

# 在手册中按 / 可以搜索，按 q 退出
```

## 二、进阶篇

> 部分工具或命令可能不自带，需要手动安装。

### lsof

全称 list open files，意为列出打开的文件列表，在 Unix 中一切（包括网络套接口）都是文件。

这个命令非常强大，大多数时候用它来从系统获得与网络连接相关的信息。**前端开发中常用于查看端口占用情况。**

```bash
# 显示所有网络连接
lsof -i

# 显示所有 IPv6 连接
lsof -i 6

# 显示所有 UDP 连接
lsof -i udp

# 查看指定端口相关信息（前端常用，比如查看 3000 端口）
lsof -i :8000

# 查看指定端口范围相关信息
lsof -i :8000-9000

# 获取占用了指定端口的程序进程的 PID
lsof -t -i :8000

# 杀掉占用指定端口的进程（比如端口被占用无法启动开发服务器时）
kill $(lsof -t -i :8000)

# 列出指定用户打开的所有内容
lsof -u viki

# 杀死指定用户的所有进程
kill -9 `lsof -t -u viki`

# 查看指定进程 ID 已打开的内容
lsof -p 10075
```

### ping

ping 指令常使用**互联网控制报文协议**（ICMP），向目标主机发出要求回应的信息，来确认目标主机是否运作正常。

**常用于：**

- 确定网络和各个外部主机的状态
- 跟踪和隔离硬件与软件问题
- 测试、评估和管理网络
- 测试 API 服务器是否可达

```bash
# ping 目标主机，需要手动终止（Ctrl + C）
ping viki.moe

# 指定收发数据包的次数为 6
ping -c 6 viki.moe

# 发送周期为 3 秒，每次发送 1024 字节
ping -i 3 -s 1024 viki.moe
```

**ping 结果代表的意义**

- `bytes` - 数据包大小单位，即字节
- `time` - 响应时间，越小说明速度越快
- `icmp_seq` - 发送的 ICMP 包的序号
- `TTL` - 即 Time to Live，数据包的生存时间

> TTL（Time to Live）是 IP 数据包的生存时间，它的数值在传输过程中逐渐减少，每经过一个路由器就会减 1，当 TTL 减为 0 时，该数据包将被丢弃。在 ping 命令中，TTL 表示发送 ICMP 回显请求时数据包的生存时间。可以通过 ping 命令查看从一台计算机到另一台计算机所经过的路由器的数量，TTL 值会显示每一次经过路由器后的值。

### ssh

全称 Secure Shell，ssh 命令用于通过远程登录安全地连接到远程计算机。它使用加密技术对登录信息和数据进行保护。

**前端开发者常用场景：** 部署项目到服务器、管理云服务器、执行远程命令等。

```bash
# 连接到远程主机
ssh username@remote_host

# 使用不同的端口号连接
ssh -p port_number username@remote_host

# 连接时禁用主机密钥检查（首次连接新服务器时可能需要）
ssh -o StrictHostKeyChecking=no username@remote_host

# 将本地文件传输到远程主机
scp local_file username@remote_host:/remote_folder

# 将远程主机的文件复制到本地
scp username@remote_host:/remote_folder/remote_file local_folder

# 上传整个目录到服务器
scp -r ./dist username@remote_host:/var/www/html/
```

### df

全称 disk free，df 命令用于显示文件系统的磁盘空间使用情况。

```bash
# 以人类可读的格式显示所有挂载的文件系统的磁盘使用情况
df -h

# 显示指定文件系统的磁盘使用情况
df -h /dev/sda1

# 以 1K 为单位显示所有文件系统的磁盘使用情况
df -k
```

### kill

kill 命令用于发送信号给进程，常用于终止运行中的进程。

```bash
# 结束指定进程（优雅终止）
kill PID

# 强制结束指定进程
kill -9 PID

# 结束所有名为 name 的进程
pkill name

# 结束所有父进程为 PID 的进程
killall -g PID
```

### chmod

全称 change mode，chmod 命令用于更改文件或目录的权限。

```bash
# 给文件添加可执行权限（常用于 Shell 脚本）
chmod +x filename

# 给文件添加可读写权限
chmod u+rw filename

# 给目录及其所有子目录和文件添加可读写执行权限
chmod -R u+rwx directory

# 使用数字设置权限（7=读+写+执行，6=读+写，5=读+执行，4=只读）
chmod 755 filename  # rwxr-xr-x
chmod 644 filename  # rw-r--r--
```

### chown

全称 change owner，chown 命令用于更改文件或目录的所有者和所属组。

```bash
# 更改文件的所有者为 username
chown username filename

# 更改文件的所有者和所属组
chown username:groupname filename

# 更改目录及其所有子目录和文件的所有者为 username
chown -R username directory
```

### ps

全称 process status，ps 命令用于显示系统中运行的进程的信息。

```bash
# 显示当前用户的进程
ps

# 显示所有运行中的进程
ps -e

# 显示所有进程的详细信息（常用）
ps aux

# 显示指定进程的详细信息
ps -p PID -o pid,ppid,cmd,%cpu,%mem

# 查找特定进程（配合 grep 使用）
ps aux | grep node
```

### tar

全称 tape archive，tar 命令用于创建和解压 tar 归档文件。tar 文件通常用于将一组文件打包成单个文件，以便于传输或备份。

```bash
# 创建 tar 归档文件
tar -cvf archive.tar file1 file2 directory1

# 创建 tar.gz 压缩文件（常用）
tar -czvf archive.tar.gz directory1

# 查看 tar 归档文件的内容
tar -tvf archive.tar

# 解压 tar 归档文件
tar -xvf archive.tar

# 解压 tar.gz 压缩文件
tar -xzvf archive.tar.gz

# 解压到指定目录
tar -xzvf archive.tar.gz -C /path/to/directory
```

### find

find 命令用于查找文件，可以按照名称、类型、大小等条件查找。

```bash
# 按照名称查找
find . -name "temp*"

# 按照类型查找，d 代表目录，f 代表文件
find . -type d
find . -type f

# 按照大小查找，+ 表示大于，- 表示小于
find . -size +10M

# 按照修改时间查找（天数），+ 表示更久远的时间，- 表示更新的时间
find . -mtime -30

# 查找并删除（谨慎使用）
find . -name "*.log" -delete

# 查找特定扩展名的文件
find . -name "*.js" -o -name "*.ts"
```

### grep

全称 global regular expression print，grep 命令用于查找文本内容，可以在文件中查找指定的文本并输出匹配的行。

**前端开发者常用场景：** 在代码中搜索特定函数调用、查找 TODO 注释、定位错误信息等。

```bash
# 递归查找匹配的文本（示例中为 console.log）
grep -r "console.log" src/

# 查找不匹配的文本（-v 参数表示反向匹配）
grep -rv "debugger" src/

# 查找文件内容并只输出文件名
grep -rl "React" src/

# 查找多个关键字（使用 -e 指定多个模式）
grep -rnw "src/" -e "React" -e "Vue"

# 忽略大小写查找
grep -ri "todo" src/

# 显示匹配行的前后几行（-A 后面，-B 前面，-C 前后）
grep -C 3 "function" src/index.js
```

### curl

curl 命令用于从 URL 下载文件或向服务器发送 HTTP 请求。

**前端开发者常用场景：** 测试 API 接口、下载资源文件、调试网络请求等。

```bash
# 发送 GET 请求
curl https://api.example.com/users

# 发送 POST 请求
curl -X POST https://example.com/api \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 30}'

# 下载文件并保留原文件名
curl -O https://example.com/file.zip

# 下载文件并指定文件名
curl -o myfile.zip https://example.com/file.zip

# 显示响应头信息
curl -i https://api.example.com/users

# 只显示响应头
curl -I https://api.example.com/users

# 跟随重定向
curl -L https://example.com
```

### wget

wget 命令用于从 URL 下载文件，相比 curl 更适合下载大文件，支持断点续传。

```bash
# 下载文件
wget https://example.com/file.zip

# 断点续传
wget -c https://example.com/large-file.zip

# 后台下载
wget -b https://example.com/file.zip

# 限速下载（限制为 500KB/s）
wget --limit-rate=500k https://example.com/file.zip
```

### dig

全称 domain information groper，dig 命令用于查询 DNS 服务器并返回域名的 IP 地址。

```bash
# 查询域名的 IP 地址
dig example.com

# 只显示 IP 地址（简洁输出）
dig +short example.com

# 查询特定类型的 DNS 记录
dig example.com MX  # 查询邮件服务器
dig example.com NS  # 查询域名服务器
```

### netstat

全称 network statistics，netstat 命令用于显示网络连接、路由表和网络接口信息。

```bash
# 显示所有网络连接
netstat -a

# 显示所有监听端口
netstat -tuln

# 显示路由表信息
netstat -r

# 显示网络接口信息
netstat -i

# 查看哪些进程在监听端口
netstat -tulnp
```

### nslookup

全称 name server lookup，nslookup 命令用于查询 DNS 服务器并返回域名的 IP 地址。

```bash
# 查询域名的 IP 地址
nslookup example.com

# 使用指定的 DNS 服务器查询
nslookup example.com 8.8.8.8
```

### ifconfig

全称 interface configuration，ifconfig 命令用于显示和配置网络接口信息。

> 注意：在较新的 Linux 发行版中，ifconfig 已被 ip 命令替代。

```bash
# 显示所有网络接口信息
ifconfig -a

# 显示特定网络接口信息
ifconfig eth0

# 配置网络接口信息（需要 root 权限）
sudo ifconfig eth0 192.168.0.10 netmask 255.255.255.0 up
```

### ip

ip 命令是现代 Linux 系统中用于显示和配置网络接口信息的推荐工具，功能比 ifconfig 更强大。

```bash
# 显示所有网络接口信息
ip addr show

# 简写形式
ip a

# 显示特定接口信息
ip addr show eth0

# 配置网络接口信息
sudo ip addr add 192.168.0.10/24 dev eth0

# 启动/关闭网络接口
sudo ip link set eth0 up
sudo ip link set eth0 down
```

### gzip

gzip 命令用于压缩和解压缩文件，是 GNU zip 的缩写。

```bash
# 压缩文件（会删除原文件）
gzip file.txt

# 压缩文件并保留原文件
gzip -k file.txt

# 解压缩文件
gzip -d file.txt.gz

# 查看压缩文件内容而不解压
zcat file.txt.gz

# 递归压缩目录中的所有文件
gzip -r directory/
```

## 三、实用场景篇

作为前端开发者，经常会遇到一些特定场景的需求，这里列举一些常见的实用命令组合。

### 端口和进程管理

#### 场景 1：查找占用指定端口的进程

```bash
# 方法一：使用 lsof（推荐，macOS 和 Linux 通用）
lsof -i :3000

# 方法二：使用 netstat
netstat -tuln | grep :3000

# 方法三：使用 ss（现代 Linux 推荐）
ss -tuln | grep :3000
```

#### 场景 2：杀掉占用指定端口的进程

```bash
# 方法一：使用 lsof 查找并杀掉（推荐）
kill $(lsof -t -i :3000)

# 强制杀掉
kill -9 $(lsof -t -i :3000)

# 方法二：先查找进程 ID，再杀掉
lsof -i :3000  # 查看进程信息
kill <PID>     # 使用上面查到的 PID
```

#### 场景 3：一次性杀掉多个端口的进程

```bash
# 杀掉 3000、3001、3002 端口的进程
kill $(lsof -t -i :3000) $(lsof -t -i :3001) $(lsof -t -i :3002)

# 或者使用循环
for port in 3000 3001 3002; do
  kill $(lsof -t -i :$port) 2>/dev/null
done
```

#### 场景 4：查找并杀掉指定名称的进程

```bash
# 查找 node 进程
ps aux | grep node

# 杀掉所有 node 进程（谨慎使用）
pkill node

# 杀掉特定命令的进程
pkill -f "npm run dev"

# 查找并杀掉包含特定关键词的进程
ps aux | grep "webpack" | grep -v grep | awk '{print $2}' | xargs kill
```

#### 场景 5：查看端口范围内的所有监听

```bash
# 查看 3000-4000 范围内的所有监听端口
lsof -i :3000-4000

# 查看所有 Node.js 进程占用的端口
lsof -i -P | grep node
```

### 常见开发场景

#### 场景 6：前端项目部署到服务器

```bash
# 1. 本地构建项目
npm run build

# 2. 压缩构建产物
tar -czvf dist.tar.gz dist/

# 3. 上传到服务器
scp dist.tar.gz user@server:/var/www/

# 4. 登录服务器
ssh user@server

# 5. 解压并部署
cd /var/www/
tar -xzvf dist.tar.gz
rm dist.tar.gz

# 一键部署脚本示例
# npm run build && tar -czvf dist.tar.gz dist/ && scp dist.tar.gz user@server:/var/www/ && ssh user@server "cd /var/www && tar -xzvf dist.tar.gz && rm dist.tar.gz"
```

#### 场景 7：清理 node_modules 释放空间

```bash
# 查找当前目录下所有 node_modules 的大小
find . -name "node_modules" -type d -prune -exec du -sh {} \;

# 删除当前目录下所有 node_modules
find . -name "node_modules" -type d -prune -exec rm -rf {} \;

# 删除 package-lock.json
find . -name "package-lock.json" -delete
```

#### 场景 8：批量重命名文件

```bash
# 将所有 .js 文件重命名为 .ts
for file in *.js; do
  mv "$file" "${file%.js}.ts"
done

# 批量添加前缀
for file in *.png; do
  mv "$file" "icon-$file"
done

# 批量替换文件名中的字符
for file in *; do
  mv "$file" "${file//old/new}"
done
```

#### 场景 9：查看文件或目录大小

```bash
# 查看当前目录总大小
du -sh .

# 查看当前目录下各个子目录的大小
du -sh *

# 按大小排序显示
du -sh * | sort -h

# 查看最大的 10 个文件
find . -type f -exec du -h {} \; | sort -rh | head -10
```

#### 场景 10：监控日志文件

```bash
# 实时查看日志文件的新增内容
tail -f /var/log/nginx/access.log

# 查看最后 100 行
tail -n 100 /var/log/nginx/access.log

# 同时监控多个日志文件
tail -f /var/log/nginx/*.log

# 过滤包含 ERROR 的日志
tail -f /var/log/app.log | grep ERROR
```

## 参考

- [Arch manual pages](https://man.archlinux.org/)
- [Linux 教程](https://www.myfreax.com/linux-tutorial/)
