#!/bin/sh      
cd `dirname $0`
v=`svnversion`
sed '
/SubTitle/ c\
SubTitle: '"$v"'
' Menu.txt > Menu.txt.version   
mv  Menu.txt.version  Menu.txt
