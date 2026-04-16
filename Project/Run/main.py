import streamlit.web.cli as stcli
import sys

def main():
    sys.argv = ["streamlit", "run", "UI/pages/1_汇率查询.py"]
    stcli.main()

if __name__ == "__main__":
    main()