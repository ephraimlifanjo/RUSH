#include <algorithm>
#include <cctype>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <unordered_set>
namespace fs = std::filesystem;

static std::string json_escape(const std::string& s){std::ostringstream o;for(unsigned char c:s){switch(c){case '"':o<<"\\\"";break;case '\\':o<<"\\\\";break;case '\b':o<<"\\b";break;case '\f':o<<"\\f";break;case '\n':o<<"\\n";break;case '\r':o<<"\\r";break;case '\t':o<<"\\t";break;default:if(c<0x20)o<<"\\u"<<std::hex<<std::setw(4)<<std::setfill('0')<<(int)c;else o<<c;}}return o.str();}
static std::string lower(std::string s){std::transform(s.begin(),s.end(),s.begin(),[](unsigned char c){return(char)std::tolower(c);});return s;}
static bool supported(const fs::path& p){static const std::unordered_set<std::string> exts={".pdf",".doc",".docx",".odt",".rtf",".txt",".html",".htm"};return exts.count(lower(p.extension().string()))>0;}
static bool skip_dir(const std::string& n){static const std::unordered_set<std::string> names={"node_modules",".git","$recycle.bin","system volume information","windows"};return names.count(lower(n))>0;}
static int scan(const fs::path& root){std::cout<<"[";bool first=true;std::size_t count=0;const std::size_t max_files=50000;try{fs::recursive_directory_iterator it(root,fs::directory_options::skip_permission_denied),end;for(;it!=end&&count<max_files;++it){try{if(it->is_directory()&&skip_dir(it->path().filename().string())){it.disable_recursion_pending();continue;}if(!it->is_regular_file()||!supported(it->path()))continue;auto p=it->path();auto size=(unsigned long long)it->file_size();if(!first)std::cout<<",";first=false;std::cout<<"{\"path\":\""<<json_escape(p.string())<<"\",\"size\":"<<size<<"}";count++;}catch(...){}}}catch(...){}std::cout<<"]\n";return 0;}
static int hash_file(const fs::path& p){std::ifstream f(p,std::ios::binary);if(!f){std::cerr<<"cannot open file\n";return 2;}unsigned long long h=1469598103934665603ULL;char buf[1<<16];while(f){f.read(buf,sizeof(buf));auto n=f.gcount();for(std::streamsize i=0;i<n;i++){h^=(unsigned char)buf[i];h*=1099511628211ULL;}}std::cout<<std::hex<<h<<"\n";return 0;}
int main(int argc,char**argv){if(argc<3){std::cerr<<"usage: rush-native-core <scan|hash> <path>\n";return 2;}std::string cmd=argv[1];if(cmd=="scan")return scan(argv[2]);if(cmd=="hash")return hash_file(argv[2]);std::cerr<<"unknown command\n";return 2;}
