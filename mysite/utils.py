def print_warning(msg: str):
    """
    Params:
        msg: str
    """
    red = "\033[93m"
    reset = "\033[0m"
    print(f"{red}Warning: {msg}{reset}")
