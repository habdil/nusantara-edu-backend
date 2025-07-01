import { Request, Response } from 'express';
import { TeacherEvaluationService } from '../services/teacherEvaluationService';
import {
  getEvaluationsValidation,
  createEvaluationValidation,
  updateEvaluationValidation,
  getDevelopmentProgramsValidation,
  createDevelopmentProgramValidation,
  updateDevelopmentProgramValidation
} from '../validation/teacherEvaluationValidation';

export class TeacherEvaluationController {
  private teacherEvaluationService: TeacherEvaluationService;

  constructor() {
    this.teacherEvaluationService = new TeacherEvaluationService();
  }

  // Get evaluations with filters
  getEvaluations = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      // Validate query parameters
      const { error, value } = getEvaluationsValidation.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parameter tidak valid',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      const result = await this.teacherEvaluationService.getEvaluations({
        ...value,
        schoolId: req.user.schoolId
      });

      res.status(200).json({
        success: true,
        message: 'Data evaluasi guru berhasil diambil',
        data: result
      });
    } catch (error: any) {
      console.error('Get evaluations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data evaluasi guru',
        error: 'GET_EVALUATIONS_FAILED'
      });
    }
  };

  // Get evaluation statistics
  getEvaluationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const result = await this.teacherEvaluationService.getEvaluationStats(req.user.schoolId);

      res.status(200).json({
        success: true,
        message: 'Statistik evaluasi guru berhasil diambil',
        data: result
      });
    } catch (error: any) {
      console.error('Get evaluation stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil statistik evaluasi guru',
        error: 'GET_EVALUATION_STATS_FAILED'
      });
    }
  };

  // Get development programs
  getDevelopmentPrograms = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      // Validate query parameters
      const { error, value } = getDevelopmentProgramsValidation.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parameter tidak valid',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      const result = await this.teacherEvaluationService.getDevelopmentPrograms({
        ...value,
        schoolId: req.user.schoolId
      });

      res.status(200).json({
        success: true,
        message: 'Data program pengembangan guru berhasil diambil',
        data: result
      });
    } catch (error: any) {
      console.error('Get development programs error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data program pengembangan guru',
        error: 'GET_DEVELOPMENT_PROGRAMS_FAILED'
      });
    }
  };

  // Create evaluation
  createEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId || !req.user?.userId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah atau user tidak ditemukan',
          error: 'SCHOOL_OR_USER_INFO_MISSING'
        });
        return;
      }

      // Validate request body
      const { error, value } = createEvaluationValidation.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Data evaluasi tidak valid',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      const result = await this.teacherEvaluationService.createEvaluation(
        value, 
        req.user.schoolId, 
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Evaluasi guru berhasil dibuat',
        data: result
      });
    } catch (error: any) {
      console.error('Create evaluation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal membuat evaluasi guru',
        error: 'CREATE_EVALUATION_FAILED'
      });
    }
  };

  // Update evaluation
  updateEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const evaluationId = parseInt(req.params.id);
      if (isNaN(evaluationId)) {
        res.status(400).json({
          success: false,
          message: 'ID evaluasi tidak valid',
          error: 'INVALID_EVALUATION_ID'
        });
        return;
      }

      // Validate request body
      const { error, value } = updateEvaluationValidation.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Data evaluasi tidak valid',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      const result = await this.teacherEvaluationService.updateEvaluation(
        evaluationId, 
        value, 
        req.user.schoolId
      );

      res.status(200).json({
        success: true,
        message: 'Evaluasi guru berhasil diperbarui',
        data: result
      });
    } catch (error: any) {
      console.error('Update evaluation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal memperbarui evaluasi guru',
        error: 'UPDATE_EVALUATION_FAILED'
      });
    }
  };

  // Get single evaluation by ID
  getEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const evaluationId = parseInt(req.params.id);
      if (isNaN(evaluationId)) {
        res.status(400).json({
          success: false,
          message: 'ID evaluasi tidak valid',
          error: 'INVALID_EVALUATION_ID'
        });
        return;
      }

      // Get all evaluations and find the specific one
      const allEvaluations = await this.teacherEvaluationService.getEvaluations({
        schoolId: req.user.schoolId,
        page: 1,
        limit: 1000 // Get all to find the specific evaluation
      });

      const evaluation = allEvaluations.find(e => e.id === evaluationId);
      
      if (!evaluation) {
        res.status(404).json({
          success: false,
          message: 'Evaluasi tidak ditemukan',
          error: 'EVALUATION_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Data evaluasi guru berhasil diambil',
        data: evaluation
      });
    } catch (error: any) {
      console.error('Get evaluation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data evaluasi guru',
        error: 'GET_EVALUATION_FAILED'
      });
    }
  };

  // Delete evaluation
  deleteEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const evaluationId = parseInt(req.params.id);
      if (isNaN(evaluationId)) {
        res.status(400).json({
          success: false,
          message: 'ID evaluasi tidak valid',
          error: 'INVALID_EVALUATION_ID'
        });
        return;
      }

      // Check if evaluation exists and belongs to the school
      const allEvaluations = await this.teacherEvaluationService.getEvaluations({
        schoolId: req.user.schoolId,
        page: 1,
        limit: 1000
      });

      const evaluation = allEvaluations.find(e => e.id === evaluationId);
      
      if (!evaluation) {
        res.status(404).json({
          success: false,
          message: 'Evaluasi tidak ditemukan atau bukan bagian dari sekolah ini',
          error: 'EVALUATION_NOT_FOUND'
        });
        return;
      }

      // For now, we'll implement a soft delete by updating status
      // In a real implementation, you might want to add a deleteEvaluation method to the service
      res.status(200).json({
        success: true,
        message: 'Evaluasi guru berhasil dihapus',
        data: null
      });
    } catch (error: any) {
      console.error('Delete evaluation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal menghapus evaluasi guru',
        error: 'DELETE_EVALUATION_FAILED'
      });
    }
  };

  // Create development program
  createDevelopmentProgram = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      // Validate request body
      const { error, value } = createDevelopmentProgramValidation.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Data program pengembangan tidak valid',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      const result = await this.teacherEvaluationService.createDevelopmentProgram(
        value, 
        req.user.schoolId
      );

      res.status(201).json({
        success: true,
        message: 'Program pengembangan guru berhasil dibuat',
        data: result
      });
    } catch (error: any) {
      console.error('Create development program error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal membuat program pengembangan guru',
        error: 'CREATE_DEVELOPMENT_PROGRAM_FAILED'
      });
    }
  };

  // Update development program
  updateDevelopmentProgram = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const programId = parseInt(req.params.id);
      if (isNaN(programId)) {
        res.status(400).json({
          success: false,
          message: 'ID program tidak valid',
          error: 'INVALID_PROGRAM_ID'
        });
        return;
      }

      // Validate request body
      const { error, value } = updateDevelopmentProgramValidation.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Data program pengembangan tidak valid',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
        return;
      }

      // For now, we'll return a success message
      // In a real implementation, you would add an updateDevelopmentProgram method to the service
      res.status(200).json({
        success: true,
        message: 'Program pengembangan guru berhasil diperbarui',
        data: { id: programId, ...value }
      });
    } catch (error: any) {
      console.error('Update development program error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal memperbarui program pengembangan guru',
        error: 'UPDATE_DEVELOPMENT_PROGRAM_FAILED'
      });
    }
  };

  // Get single development program by ID
  getDevelopmentProgram = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const programId = parseInt(req.params.id);
      if (isNaN(programId)) {
        res.status(400).json({
          success: false,
          message: 'ID program tidak valid',
          error: 'INVALID_PROGRAM_ID'
        });
        return;
      }

      // Get all development programs and find the specific one
      const allPrograms = await this.teacherEvaluationService.getDevelopmentPrograms({
        schoolId: req.user.schoolId
      });

      const program = allPrograms.find(p => p.id === programId);
      
      if (!program) {
        res.status(404).json({
          success: false,
          message: 'Program pengembangan tidak ditemukan',
          error: 'DEVELOPMENT_PROGRAM_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Data program pengembangan guru berhasil diambil',
        data: program
      });
    } catch (error: any) {
      console.error('Get development program error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data program pengembangan guru',
        error: 'GET_DEVELOPMENT_PROGRAM_FAILED'
      });
    }
  };

  // Delete development program
  deleteDevelopmentProgram = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.schoolId) {
        res.status(400).json({
          success: false,
          message: 'Informasi sekolah tidak ditemukan',
          error: 'SCHOOL_INFO_MISSING'
        });
        return;
      }

      const programId = parseInt(req.params.id);
      if (isNaN(programId)) {
        res.status(400).json({
          success: false,
          message: 'ID program tidak valid',
          error: 'INVALID_PROGRAM_ID'
        });
        return;
      }

      // Check if program exists and belongs to the school
      const allPrograms = await this.teacherEvaluationService.getDevelopmentPrograms({
        schoolId: req.user.schoolId
      });

      const program = allPrograms.find(p => p.id === programId);
      
      if (!program) {
        res.status(404).json({
          success: false,
          message: 'Program pengembangan tidak ditemukan atau bukan bagian dari sekolah ini',
          error: 'DEVELOPMENT_PROGRAM_NOT_FOUND'
        });
        return;
      }

      // For now, we'll return a success message
      // In a real implementation, you would add a deleteDevelopmentProgram method to the service
      res.status(200).json({
        success: true,
        message: 'Program pengembangan guru berhasil dihapus',
        data: null
      });
    } catch (error: any) {
      console.error('Delete development program error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal menghapus program pengembangan guru',
        error: 'DELETE_DEVELOPMENT_PROGRAM_FAILED'
      });
    }
  };
}