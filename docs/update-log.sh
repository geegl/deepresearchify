#!/bin/bash

# 自动更新开发日志的脚本

# 颜色定义
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

# 检查docs目录是否存在
if [ ! -d "docs" ]; then
  echo -e "${YELLOW}警告: docs目录不存在，正在创建...${NC}"
  mkdir -p docs
fi

# 检查开发日志文件是否存在
if [ ! -f "docs/development-log.md" ]; then
  echo -e "${YELLOW}警告: 开发日志文件不存在，请先创建开发日志文件${NC}"
  exit 1
fi

# 检查架构文档是否存在
if [ ! -f "docs/project-architecture.md" ]; then
  echo -e "${YELLOW}警告: 项目架构文档不存在，请先创建架构文档${NC}"
  exit 1
fi

# 显示架构文档和开发日志
echo -e "${GREEN}=== 查看项目架构 ===${NC}"
echo -e "${BLUE}提示: 请先阅读项目架构，确保新功能符合架构设计${NC}"
echo "按Enter键查看项目架构..."
read
less docs/project-architecture.md

echo -e "${GREEN}=== 查看最近开发日志 ===${NC}"
echo -e "${BLUE}提示: 请查看最近的开发历史，了解项目进展${NC}"
echo "按Enter键查看开发日志..."
read
less docs/development-log.md

# 添加新的日志条目
echo -e "${GREEN}=== 添加新的开发日志 ===${NC}"
echo -e "${BLUE}是否要添加新的开发日志条目? (y/n)${NC}"
read add_entry

if [ "$add_entry" = "y" ]; then
  # 获取当前日期
  current_date=$(date +"%Y-%m-%d")
  
  # 获取日志信息
  echo -e "${BLUE}请输入功能/修复名称:${NC}"
  read feature_name
  
  echo -e "${BLUE}请输入开发者姓名/ID:${NC}"
  read developer
  
  echo -e "${BLUE}请输入变更内容 (每行一个，输入空行结束):${NC}"
  changes=""
  while true; do
    read line
    if [ -z "$line" ]; then
      break
    fi
    changes="$changes- $line\n"
  done
  
  echo -e "${BLUE}请输入涉及的文件 (每行一个，输入空行结束):${NC}"
  files=""
  while true; do
    read line
    if [ -z "$line" ]; then
      break
    fi
    files="$files- $line\n"
  done
  
  echo -e "${BLUE}请描述此变更如何影响或符合项目架构:${NC}"
  read architecture_impact
  
  echo -e "${BLUE}请输入开发过程中的注意事项 (可选):${NC}"
  read notes
  
  # 创建日志条目
  log_entry="\n### [$current_date] - $feature_name\n\n#### 开发者\n$developer\n\n#### 变更内容\n$changes\n#### 涉及文件\n$files\n#### 架构影响\n$architecture_impact\n\n#### 注意事项\n$notes\n"
  
  # 添加到开发日志文件
  # 在"## 日志条目"后插入新条目
  awk -v log="$log_entry" '/^## 日志条目/{print; print log; next}1' docs/development-log.md > docs/development-log.md.tmp
  mv docs/development-log.md.tmp docs/development-log.md
  
  echo -e "${GREEN}开发日志已更新!${NC}"
  
  # 询问是否需要更新架构文档
  echo -e "${BLUE}此变更是否需要更新项目架构文档? (y/n)${NC}"
  read update_arch
  
  if [ "$update_arch" = "y" ]; then
    echo -e "${YELLOW}请手动更新 docs/project-architecture.md 文件${NC}"
    echo "按Enter键打开架构文档进行编辑..."
    read
    ${EDITOR:-vim} docs/project-architecture.md
  fi
fi

echo -e "${GREEN}完成! 记得在开发过程中遵循项目架构规范。${NC}"