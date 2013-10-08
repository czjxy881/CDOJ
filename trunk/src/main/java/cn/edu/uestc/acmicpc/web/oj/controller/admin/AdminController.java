package cn.edu.uestc.acmicpc.web.oj.controller.admin;

import cn.edu.uestc.acmicpc.util.Global;
import cn.edu.uestc.acmicpc.util.annotation.LoginPermit;
import cn.edu.uestc.acmicpc.web.oj.controller.base.BaseController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Description
 * TODO(mzry1992)
 */
@Controller
@RequestMapping("/admin")
public class AdminController extends BaseController {

  @RequestMapping("index")
  @LoginPermit(Global.AuthenticationType.ADMIN)
  public String index() {
    return "admin/index";
  }
}